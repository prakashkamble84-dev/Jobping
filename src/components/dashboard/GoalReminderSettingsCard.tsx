import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Bell,
  BellRing,
  Mail,
  Smartphone,
  Sparkles,
  Flame,
  CheckCircle2,
  Clock,
  Shield,
  Send,
  History,
  AlertCircle,
  Eye,
  Check,
  X,
  Volume2,
} from 'lucide-react';
import { User, CareerProfile, DailyCheckIn, StreakStats, ReminderSettings, ReminderDispatchRecord } from '../../types';
import { DashboardCard } from '../common/DashboardCard';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';
import {
  getReminderSettings,
  saveReminderSettings,
  getReminderDispatchLogs,
  recordReminderDispatch,
  requestBrowserNotificationPermission,
  triggerBrowserPushNotification,
  generateNudgeCopy,
} from '../../services/reminderService';
import { useToast } from '../../context/ToastContext';

interface GoalReminderSettingsCardProps {
  user: User;
  profile: CareerProfile | null;
  checkIn: DailyCheckIn | null;
  stats: StreakStats;
}

export const GoalReminderSettingsCard: React.FC<GoalReminderSettingsCardProps> = ({
  user,
  profile,
  checkIn,
  stats,
}) => {
  const { showSuccess, showError, showInfo } = useToast();

  const [settings, setSettings] = useState<ReminderSettings>(() =>
    getReminderSettings(user.uid, user.email)
  );
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>('default');
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [dispatchLogs, setDispatchLogs] = useState<ReminderDispatchRecord[]>(() =>
    getReminderDispatchLogs(user.uid)
  );
  const [showEmailPreviewModal, setShowEmailPreviewModal] = useState<boolean>(false);
  const [testChannel, setTestChannel] = useState<'all' | 'push' | 'email'>('all');

  // Check browser notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const handleUpdateSetting = <K extends keyof ReminderSettings>(key: K, value: ReminderSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    saveReminderSettings(user.uid, updated);
  };

  const handleToggleChannel = (channel: keyof ReminderSettings['channels']) => {
    const updatedChannels = {
      ...settings.channels,
      [channel]: !settings.channels[channel],
    };
    handleUpdateSetting('channels', updatedChannels);
  };

  const handleRequestPushPermission = async () => {
    const permission = await requestBrowserNotificationPermission();
    setBrowserPermission(permission);
    if (permission === 'granted') {
      showSuccess('Push Notifications Enabled!', 'You will receive browser notifications for your evening goals.');
      handleUpdateSetting('channels', { ...settings.channels, browserPush: true });
    } else if (permission === 'denied') {
      showError('Permission Blocked', 'Please enable notification permissions in your browser settings.');
    }
  };

  const handleSendTestNudge = async () => {
    setIsSendingTest(true);
    const goalText = checkIn?.goal || 'Review 5 Frontend Interview questions';
    const targetRole = profile?.targetJob || 'Software Developer';
    const copy = generateNudgeCopy(goalText, stats.currentStreak, settings.nudgeTone, targetRole);

    try {
      let pushSuccess = false;
      if (settings.channels.browserPush) {
        pushSuccess = triggerBrowserPushNotification(copy.title, copy.body);
        recordReminderDispatch(user.uid, {
          channel: 'browser_push',
          title: copy.title,
          message: copy.body,
          status: pushSuccess ? 'delivered' : 'simulated',
          streakAtTime: stats.currentStreak,
        });
      }

      if (settings.channels.email) {
        recordReminderDispatch(user.uid, {
          channel: 'email',
          title: copy.emailSubject,
          message: `Sent to ${settings.emailAddress || user.email}`,
          status: 'simulated',
          streakAtTime: stats.currentStreak,
        });
      }

      if (settings.channels.inAppToast) {
        recordReminderDispatch(user.uid, {
          channel: 'in_app',
          title: copy.title,
          message: copy.body,
          status: 'delivered',
          streakAtTime: stats.currentStreak,
        });
      }

      // Refresh logs
      setDispatchLogs(getReminderDispatchLogs(user.uid));

      showSuccess(
        'Test Evening Nudge Dispatched! 🔔',
        `Dispatched via ${settings.channels.browserPush ? 'Browser Push, ' : ''}${
          settings.channels.email ? 'Email, ' : ''
        }In-App Nudge.`
      );
    } catch (err: any) {
      showError('Nudge dispatch failed', err.message || 'Could not send test reminder.');
    } finally {
      setIsSendingTest(false);
    }
  };

  const goalText = checkIn?.goal || 'Practice 1 Mock Interview';
  const copyPreview = generateNudgeCopy(goalText, stats.currentStreak, settings.nudgeTone, profile?.targetJob || 'Job Target');

  return (
    <DashboardCard
      id="goal-reminder-settings-card"
      title="EVENING GOAL NUDGE & REMINDER SYSTEM"
      subtitle="Automated browser push notifications & email nudges to protect your learning streak"
      icon={<BellRing className="w-5 h-5 text-amber-500" />}
      badge="Automated"
      className="border-amber-100 bg-gradient-to-b from-white via-amber-50/10 to-white shadow-sm"
    >
      <div className="space-y-6">
        {/* Main Enable Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-amber-50/50 border border-amber-200/80">
          <div className="flex items-center gap-3.5">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              settings.enabled ? 'bg-amber-500 text-white shadow-xs' : 'bg-slate-200 text-slate-500'
            }`}>
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-slate-900">
                  Daily Evening Learning Nudges
                </h4>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                  settings.enabled ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}>
                  {settings.enabled ? 'Active' : 'Paused'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Automatically alerts you if today's daily goal remains unchecked by evening time.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="toggle-reminders-switch"
                type="checkbox"
                checked={settings.enabled}
                onChange={(e) => handleUpdateSetting('enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600" />
            </label>
          </div>
        </div>

        {/* Configuration Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Schedule & Time */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Evening Alert Time</span>
            </div>

            <div className="space-y-2">
              <label className="block text-xs text-slate-600 font-medium">
                When should we nudge you?
              </label>
              <select
                id="reminder-time-select"
                value={settings.eveningReminderTime}
                onChange={(e) => handleUpdateSetting('eveningReminderTime', e.target.value)}
                className="w-full text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-amber-500 outline-hidden"
              >
                <option value="18:00">6:00 PM (Early Evening)</option>
                <option value="19:00">7:00 PM (After Work / College)</option>
                <option value="20:00">8:00 PM (Standard Evening - Recommended)</option>
                <option value="21:00">9:00 PM (Late Evening)</option>
                <option value="22:00">10:00 PM (Night Owl / Last Call)</option>
              </select>

              <label className="flex items-center gap-2 pt-1 text-xs text-slate-600 cursor-pointer">
                <input
                  id="weekend-reminders-checkbox"
                  type="checkbox"
                  checked={settings.weekendReminders}
                  onChange={(e) => handleUpdateSetting('weekendReminders', e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Include Saturdays & Sundays</span>
              </label>
            </div>
          </div>

          {/* Channels Selection */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>Notification Channels</span>
            </div>

            <div className="space-y-2.5">
              {/* Browser Push */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-amber-600" />
                  <span className="font-semibold text-slate-800">Browser Push</span>
                </div>
                {browserPermission === 'granted' ? (
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      id="channel-push-checkbox"
                      type="checkbox"
                      checked={settings.channels.browserPush}
                      onChange={() => handleToggleChannel('browserPush')}
                      className="rounded text-amber-600 focus:ring-amber-500"
                    />
                  </label>
                ) : (
                  <button
                    id="enable-browser-push-btn"
                    onClick={handleRequestPushPermission}
                    className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                  >
                    Enable
                  </button>
                )}
              </div>

              {/* Email Nudges */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-semibold text-slate-800">Email Digest</span>
                </div>
                <input
                  id="channel-email-checkbox"
                  type="checkbox"
                  checked={settings.channels.email}
                  onChange={() => handleToggleChannel('email')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </div>

              {/* In-App Toast Alert */}
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200/70 text-xs">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-semibold text-slate-800">In-App Banner</span>
                </div>
                <input
                  id="channel-inapp-checkbox"
                  type="checkbox"
                  checked={settings.channels.inAppToast}
                  onChange={() => handleToggleChannel('inAppToast')}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Tone & Motivation Style */}
          <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Motivation Style</span>
            </div>

            <div className="space-y-1.5">
              {[
                { id: 'streak_focused', label: 'Streak Protector 🔥', desc: 'Focuses on maintaining active streak' },
                { id: 'career_coach', label: 'Career Coach 💼', desc: 'Emphasizes role progress and readiness' },
                { id: 'friendly', label: 'Friendly Encourager 🌟', desc: 'Gentle, supportive check-in tone' },
              ].map((item) => (
                <button
                  key={item.id}
                  id={`tone-${item.id}-btn`}
                  onClick={() => handleUpdateSetting('nudgeTone', item.id as any)}
                  className={`w-full text-left p-2 rounded-lg border text-xs transition-all flex items-start gap-2 ${
                    settings.nudgeTone === item.id
                      ? 'bg-amber-50 border-amber-300 font-semibold text-amber-900 shadow-2xs'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className={`w-3.5 h-3.5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${
                    settings.nudgeTone === item.id ? 'border-amber-600 bg-amber-600' : 'border-slate-400'
                  }`}>
                    {settings.nudgeTone === item.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                  </div>
                  <div>
                    <div className="font-bold">{item.label}</div>
                    <div className="text-[10px] text-slate-500 font-normal leading-tight">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Preview Box & Actions */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Live Nudge Preview ({settings.nudgeTone.replace('_', ' ')})
              </span>
            </div>
            <div className="text-xs text-slate-700">
              <strong className="text-slate-900 font-semibold">{copyPreview.title}</strong> — {copyPreview.body}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SecondaryButton
              id="preview-email-template-btn"
              onClick={() => setShowEmailPreviewModal(true)}
              icon={<Eye className="w-3.5 h-3.5" />}
              className="text-xs py-2 px-3"
            >
              Email Preview
            </SecondaryButton>

            <PrimaryButton
              id="send-test-nudge-btn"
              onClick={handleSendTestNudge}
              disabled={isSendingTest}
              icon={<Send className="w-3.5 h-3.5" />}
              className="bg-amber-600 hover:bg-amber-700 text-xs py-2 px-3.5 shadow-amber-100"
            >
              {isSendingTest ? 'Sending...' : 'Test Evening Nudge'}
            </PrimaryButton>
          </div>
        </div>

        {/* Recent Dispatch Audit Log */}
        {dispatchLogs.length > 0 && (
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Recent Nudge Dispatch History</span>
              </div>
              <span className="text-[11px] text-slate-500">
                {dispatchLogs.length} logged
              </span>
            </div>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {dispatchLogs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.channel === 'browser_push'
                        ? 'bg-amber-100 text-amber-800'
                        : log.channel === 'email'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {log.channel === 'browser_push' ? 'Push' : log.channel === 'email' ? 'Email' : 'In-App'}
                    </span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{log.title}</span>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-slate-500 text-[11px]">
                    <span className="flex items-center gap-1 text-emerald-600 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> {log.status}
                    </span>
                    <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Email Preview Modal */}
      <AnimatePresence>
        {showEmailPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-indigo-600" />
                  <h3 className="text-base font-bold text-slate-900">Email Reminder Template</h3>
                </div>
                <button
                  id="close-email-preview-btn"
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Simulated Email Envelope */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">From:</span>
                  <strong className="text-slate-800">JobReady AI &lt;reminders@jobready.ai&gt;</strong>
                </div>
                <div className="flex justify-between border-b border-slate-200/60 pb-1.5">
                  <span className="text-slate-500">To:</span>
                  <strong className="text-slate-800">{settings.emailAddress || user.email || 'user@example.com'}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Subject:</span>
                  <strong className="text-slate-900">{copyPreview.emailSubject}</strong>
                </div>
              </div>

              {/* Email Body Card */}
              <div className="rounded-xl border border-amber-200 bg-gradient-to-b from-white to-amber-50/20 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
                    JR
                  </div>
                  <div>
                    <span className="text-xs font-extrabold text-slate-900">JobReady AI</span>
                    <span className="text-[10px] text-slate-500 block">Career Preparation Companion</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base font-extrabold text-slate-900">
                    {stats.currentStreak > 0 ? `Hi ${user.name || 'there'}, protect your ${stats.currentStreak}-day learning streak!` : `Hi ${user.name || 'there'}, ready for tonight's quick check-in?`}
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    You set a goal today: <strong className="text-slate-800 font-semibold">{goalText}</strong>. It takes just 15 minutes to complete and keeps your momentum moving toward your {profile?.targetJob || 'target role'}.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-amber-900">Current Streak: {stats.currentStreak} Days</span>
                  </div>
                  <span className="font-extrabold text-amber-700">+5 pts when completed</span>
                </div>

                <div className="pt-2">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setShowEmailPreviewModal(false);
                      showSuccess('Goal completed from reminder!', 'Your daily check-in has been logged.');
                    }}
                    className="block w-full py-2.5 rounded-xl bg-indigo-600 text-white text-center font-bold text-xs shadow-sm hover:bg-indigo-700 transition-colors"
                  >
                    Open JobReady & Complete Goal
                  </a>
                </div>
              </div>

              <div className="flex justify-end">
                <SecondaryButton
                  id="dismiss-email-modal-btn"
                  onClick={() => setShowEmailPreviewModal(false)}
                  className="text-xs py-2 px-4"
                >
                  Close Preview
                </SecondaryButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardCard>
  );
};
