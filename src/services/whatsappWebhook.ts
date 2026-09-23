import type { Request, Response, Router } from 'express';
import express from 'express';
import crypto from 'crypto';
import {
  updateMatchStage,
  getMatchById,
  createMatch,
  getAllCandidates,
  getMatchesByJobId,
} from './dbService';
import {
  getWhatsAppConfig,
  formatPhoneNumberForWhatsApp,
  parseIncomingWhatsAppWebhook,
  IncomingWebhookEvent,
} from './whatsappService';
import { getSupabaseClient } from './supabaseClient';
import { MatchStage } from '../types';

/**
 * Result structure for processed WhatsApp webhook events
 */
export interface WebhookDispatchResult {
  eventType: string;
  senderPhone?: string;
  messageId?: string;
  matchedRecordId?: string;
  action: string;
  stageUpdated?: MatchStage;
  success: boolean;
  error?: string;
}

/**
 * Verify Meta X-Hub-Signature-256 HMAC-SHA256 signature
 *
 * @param payload Raw body buffer or JSON string
 * @param signatureHeader Header string (e.g. 'sha256=abcdef...')
 * @param appSecret Meta WhatsApp App Secret
 */
export function verifyMetaSignature(
  payload: string | Buffer,
  signatureHeader: string | undefined,
  appSecret: string | undefined
): boolean {
  // If no secret configured (e.g. local preview/dev), allow request to proceed
  if (!appSecret || appSecret.trim() === '') {
    return true;
  }

  if (!signatureHeader || !signatureHeader.startsWith('sha256=')) {
    return false;
  }

  try {
    const signatureHash = signatureHeader.substring(7);
    const hmac = crypto.createHmac('sha256', appSecret);
    const bodyContent = typeof payload === 'string' ? payload : payload.toString('utf-8');
    const expectedHash = hmac.update(bodyContent).digest('hex');

    const expectedBuffer = Buffer.from(expectedHash, 'hex');
    const signatureBuffer = Buffer.from(signatureHash, 'hex');

    if (expectedBuffer.length !== signatureBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  } catch (err) {
    console.warn('Error verifying Meta HMAC signature:', err);
    return false;
  }
}

/**
 * Express GET Handler: Webhook Verification for Meta Developer Portal
 */
export function handleWebhookVerification(req: Request, res: Response): void {
  const mode = req.query['hub.mode'] as string;
  const token = req.query['hub.verify_token'] as string;
  const challenge = req.query['hub.challenge'] as string;

  const config = getWhatsAppConfig();
  const expectedToken =
    process.env.VITE_WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN ||
    config.webhookVerifyToken ||
    'jobmatcher_secure_token';

  if (mode === 'subscribe' && token === expectedToken) {
    console.log('[WhatsApp Webhook] Subscription verified successfully.');
    res.status(200).send(challenge);
    return;
  }

  console.warn('[WhatsApp Webhook] Verification failed. Received token mismatch.');
  res.status(403).json({ error: 'Verification failed: invalid token or mode.' });
}

/**
 * Express POST Handler: Processes incoming candidate interactions and updates database via dbService
 */
export async function handleWebhookEvent(req: Request, res: Response): Promise<void> {
  const signature = req.headers['x-hub-signature-256'] as string | undefined;
  const appSecret =
    process.env.VITE_WHATSAPP_APP_SECRET ||
    process.env.WHATSAPP_APP_SECRET ||
    getWhatsAppConfig().appSecret;

  // 1. Verify Request Signature (HMAC-SHA256)
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const isValidSignature = verifyMetaSignature(rawBody, signature, appSecret);

  if (!isValidSignature) {
    console.warn('[WhatsApp Webhook] Invalid X-Hub-Signature-256 signature.');
    res.status(401).json({ error: 'Invalid message signature.' });
    return;
  }

  const payload = req.body;
  const results: WebhookDispatchResult[] = [];

  try {
    // 2. Parse Incoming Events (Messages and Status Delivery Receipts)
    const events: IncomingWebhookEvent[] = parseIncomingWhatsAppWebhook(payload);
    const client = getSupabaseClient();
    const timestamp = new Date().toISOString();

    for (const event of events) {
      // ----------------------------------------------------
      // EVENT TYPE A: Delivery / Read Receipt Updates
      // ----------------------------------------------------
      if (event.eventType === 'status' && event.messageId) {
        const isDeliveredOrRead = event.status === 'delivered' || event.status === 'read';

        try {
          // Update matches table with delivery confirmation
          await client
            .from('matches')
            .update({
              whatsapp_alert_sent: isDeliveredOrRead,
              updated_at: timestamp,
            })
            .eq('whatsapp_message_sid', event.messageId);

          results.push({
            eventType: 'status',
            messageId: event.messageId,
            action: `Message status updated to ${event.status}`,
            success: true,
          });
        } catch (dbErr: any) {
          console.warn('[WhatsApp Webhook] DB error on status update:', dbErr.message);
          results.push({
            eventType: 'status',
            messageId: event.messageId,
            action: 'status_update',
            success: false,
            error: dbErr.message,
          });
        }
        continue;
      }

      // ----------------------------------------------------
      // EVENT TYPE B: Inbound Candidate Message / Quick Reply
      // ----------------------------------------------------
      if (event.eventType === 'message' && event.senderPhone) {
        const text = (event.textBody || '').trim();
        const payloadStr = (event.quickReplyPayload || text).trim();
        const formattedSender = formatPhoneNumberForWhatsApp(event.senderPhone);
        const last10Digits = formattedSender.slice(-10);

        // Case 1: Candidate Quick-Applied (e.g., button payload "APPLY_job_123" or text "APPLY", "YES")
        const isApplyAction =
          payloadStr.startsWith('APPLY_') ||
          payloadStr.startsWith('INTERESTED_') ||
          text.toUpperCase() === 'APPLY' ||
          text.toUpperCase() === 'YES' ||
          text.toUpperCase() === '1';

        if (isApplyAction) {
          const targetJobId = payloadStr.startsWith('APPLY_')
            ? payloadStr.replace('APPLY_', '')
            : payloadStr.startsWith('INTERESTED_')
            ? payloadStr.replace('INTERESTED_', '')
            : undefined;

          try {
            // Locate candidate record by phone number in database
            const { data: candidates } = await client
              .from('candidates')
              .select('id, full_name, email, phone_number, current_city')
              .or(`phone_number.ilike.%${last10Digits}%,id.ilike.%${last10Digits}%`)
              .limit(1);

            const candidate = candidates?.[0];

            // Locate match record
            let matchQuery = client.from('matches').select('*');
            if (targetJobId) {
              matchQuery = matchQuery.eq('job_id', targetJobId);
            }
            if (candidate?.id) {
              matchQuery = matchQuery.eq('candidate_id', candidate.id);
            } else {
              matchQuery = matchQuery.ilike('candidate_phone', `%${last10Digits}%`);
            }

            const { data: matches } = await matchQuery.limit(1);
            const match = matches?.[0];

            if (match) {
              // Update match pipeline stage to 'applied' via dbService
              await updateMatchStage(match.id, 'applied');

              // Also update applied_at timestamp
              await client
                .from('matches')
                .update({
                  applied_at: timestamp,
                  updated_at: timestamp,
                })
                .eq('id', match.id);

              results.push({
                eventType: 'candidate_apply',
                senderPhone: formattedSender,
                matchedRecordId: match.id,
                stageUpdated: 'applied',
                action: `Updated match ${match.id} to 'applied' stage for candidate ${match.candidate_name}`,
                success: true,
              });
            } else {
              results.push({
                eventType: 'candidate_apply',
                senderPhone: formattedSender,
                action: 'No pending match record found for sender phone',
                success: false,
              });
            }
          } catch (candErr: any) {
            console.warn('[WhatsApp Webhook] Error updating application in database:', candErr);
            results.push({
              eventType: 'candidate_apply',
              senderPhone: formattedSender,
              action: 'db_update_failed',
              success: false,
              error: candErr.message,
            });
          }
          continue;
        }

        // Case 2: Candidate Confirmed Interview (e.g. "CONFIRM", "ACCEPT", "YES")
        const isConfirmAction =
          text.toUpperCase() === 'CONFIRM' ||
          text.toUpperCase().includes('CONFIRM') ||
          payloadStr.startsWith('CONFIRM_INTERVIEW_');

        if (isConfirmAction) {
          try {
            const { data: interviewMatches } = await client
              .from('matches')
              .select('id, job_id, candidate_name, stage')
              .ilike('candidate_phone', `%${last10Digits}%`)
              .in('stage', ['interviewing', 'shortlisted'])
              .limit(1);

            const interviewMatch = interviewMatches?.[0];
            if (interviewMatch) {
              await updateMatchStage(interviewMatch.id, 'interviewing');

              results.push({
                eventType: 'interview_confirm',
                senderPhone: formattedSender,
                matchedRecordId: interviewMatch.id,
                stageUpdated: 'interviewing',
                action: `Confirmed interview attendance for candidate ${interviewMatch.candidate_name}`,
                success: true,
              });
            }
          } catch (intErr: any) {
            console.warn('[WhatsApp Webhook] Error confirming interview:', intErr);
          }
          continue;
        }

        // Case 3: Candidate Declined or Unsubscribed ("DECLINE", "NOT INTERESTED", "STOP")
        const isDeclineAction =
          text.toUpperCase() === 'DECLINE' ||
          text.toUpperCase().includes('NOT INTERESTED') ||
          text.toUpperCase() === 'STOP';

        if (isDeclineAction) {
          try {
            const { data: declineMatches } = await client
              .from('matches')
              .select('id')
              .ilike('candidate_phone', `%${last10Digits}%`)
              .eq('stage', 'discovered')
              .limit(1);

            if (declineMatches?.[0]) {
              await updateMatchStage(declineMatches[0].id, 'rejected');

              results.push({
                eventType: 'candidate_decline',
                senderPhone: formattedSender,
                matchedRecordId: declineMatches[0].id,
                stageUpdated: 'rejected',
                action: 'Candidate declined job opportunity',
                success: true,
              });
            }
          } catch (decErr: any) {
            console.warn('[WhatsApp Webhook] Error handling decline:', decErr);
          }
          continue;
        }
      }
    }

    // Meta WhatsApp Cloud API requires a 200 OK acknowledgment
    res.status(200).json({
      success: true,
      processed: results.length,
      events: results,
    });
  } catch (err: any) {
    console.error('[WhatsApp Webhook] Unexpected error in webhook processing:', err);
    res.status(200).json({
      success: false,
      error: err.message || 'Internal processing error',
    });
  }
}

/**
 * Creates and configures an Express Router for WhatsApp webhooks
 */
export function createWhatsAppWebhookRouter(): Router {
  const router = express.Router();

  // GET: Subscription Verification
  router.get('/webhook', handleWebhookVerification);

  // POST: Event Notification Handler
  router.post('/webhook', handleWebhookEvent);

  return router;
}

export default {
  verifyMetaSignature,
  handleWebhookVerification,
  handleWebhookEvent,
  createWhatsAppWebhookRouter,
};
