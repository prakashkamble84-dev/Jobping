# Firestore Database Schema Architecture

This document specifies the Firestore database collection structures, field definitions, relationships, and indexing strategies for the JobReady platform dual-role ecosystem (**Candidate** & **Employer**).

---

## 1. Entity Relationship & Collection Overview

```
Firestore Root
 ├── users/ {userId}          <-- Base authentication identity, role discriminator, contact & preferences
 ├── companies/ {companyId}   <-- Employer organization details, branding, and recruiter authorization
 ├── jobs/ {jobId}            <-- Job openings with required/preferred skills, location, and match thresholds
 └── matches/ {matchId}       <-- Candidate-to-Job match evaluations, scores, and notification delivery states
```

---

## 2. Collection Schema Specifications

### 2.1 `users` Collection
* **Document ID**: Matches Firebase Authentication UID (`request.auth.uid`).
* **Purpose**: Identity management, role-based access control (RBAC), and contact channels.

```json
{
  "uid": "usr_98a7b6c5d4",
  "email": "alex.kumar@example.com",
  "phoneNumber": "+919876543210",
  "role": "candidate", // "candidate" | "employer" | "admin"
  "displayName": "Alex Kumar",
  "photoUrl": "https://storage.googleapis.com/.../avatar.jpg",
  "companyId": null, // Reference to companies/{companyId} if role === "employer"
  "candidateProfile": {
    "headline": "Full Stack Developer | React, TypeScript & Node.js",
    "experienceLevel": "mid_level", // "fresher" | "junior" | "mid_level" | "senior" | "lead"
    "yearsOfExperience": 3.5,
    "currentCity": "Bangalore",
    "preferredCities": ["Bangalore", "Pune", "Remote"],
    "workModes": ["hybrid", "remote"], // "onsite" | "hybrid" | "remote"
    "resumeUrl": "https://storage.googleapis.com/.../resume.pdf",
    "skills": [
      {
        "name": "React",
        "normalizedKey": "react",
        "yearsUsed": 3.0,
        "proficiency": "advanced",
        "isPrimary": true
      },
      {
        "name": "TypeScript",
        "normalizedKey": "typescript",
        "yearsUsed": 2.5,
        "proficiency": "advanced",
        "isPrimary": true
      },
      {
        "name": "Node.js",
        "normalizedKey": "nodejs",
        "yearsUsed": 2.0,
        "proficiency": "intermediate",
        "isPrimary": false
      }
    ],
    "normalizedSkillKeys": ["react", "typescript", "nodejs"]
  },
  "notificationPreferences": {
    "whatsappEnabled": true,
    "emailEnabled": true,
    "pushEnabled": true
  },
  "accountStatus": "active", // "active" | "suspended" | "pending_verification"
  "createdAt": "2026-09-22T10:00:00.000Z",
  "updatedAt": "2026-09-22T11:30:00.000Z"
}
```

---

### 2.2 `companies` Collection
* **Document ID**: Generated unique ID (e.g., `comp_alpha123`) or slug.
* **Purpose**: Organization profiles, corporate branding, verified status, and team member authorization.

```json
{
  "id": "comp_alpha123",
  "name": "TechCorp Innovations",
  "legalName": "TechCorp Solutions India Pvt. Ltd.",
  "slug": "techcorp-innovations",
  "logoUrl": "https://storage.googleapis.com/.../techcorp-logo.png",
  "website": "https://techcorp.io",
  "industry": "FinTech / SaaS",
  "companySize": "51-200", // "1-10" | "11-50" | "51-200" | "201-500" | "500+"
  "headquarters": {
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India"
  },
  "about": "Building next-generation automated banking and payments workflows.",
  "verifiedBadge": true,
  "ownerUserId": "usr_emp_001",
  "recruiterUserIds": ["usr_emp_001", "usr_emp_002"],
  "activeJobCount": 4,
  "createdAt": "2026-09-01T08:00:00.000Z",
  "updatedAt": "2026-09-22T09:15:00.000Z"
}
```

---

### 2.3 `jobs` Collection
* **Document ID**: Generated unique ID (e.g., `job_react_dev_99`).
* **Purpose**: Job postings containing qualification criteria, skill weights, location settings, and denormalized company data for fast read-rendering.

```json
{
  "id": "job_react_dev_99",
  "companyId": "comp_alpha123",
  "postedByUserId": "usr_emp_001",
  "companySummary": {
    "name": "TechCorp Innovations",
    "logoUrl": "https://storage.googleapis.com/.../techcorp-logo.png",
    "city": "Bangalore",
    "verified": true
  },
  "title": "Senior Frontend Engineer (React / TypeScript)",
  "description": "We are seeking a senior frontend engineer to lead client dashboard modernization...",
  "department": "Engineering",
  "experienceLevel": "senior", // "fresher" | "junior" | "mid_level" | "senior" | "lead"
  "minYearsExperience": 3.0,
  "maxYearsExperience": 6.0,
  "workMode": "hybrid", // "onsite" | "hybrid" | "remote"
  "location": {
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India"
  },
  "compensation": {
    "currency": "INR",
    "minSalary": 1400000,
    "maxSalary": 2000000,
    "isDisclosed": true
  },
  "skills": [
    {
      "name": "React",
      "normalizedKey": "react",
      "isMandatory": true,
      "minYearsRequired": 3.0
    },
    {
      "name": "TypeScript",
      "normalizedKey": "typescript",
      "isMandatory": true,
      "minYearsRequired": 2.0
    },
    {
      "name": "Tailwind CSS",
      "normalizedKey": "tailwindcss",
      "isMandatory": false,
      "minYearsRequired": 1.0
    }
  ],
  "mandatorySkillKeys": ["react", "typescript"],
  "allNormalizedSkillKeys": ["react", "typescript", "tailwindcss"],
  "status": "active", // "draft" | "active" | "paused" | "closed"
  "matchThresholdPercentage": 75.0, // Minimum % score needed to trigger WhatsApp alert
  "applicantCount": 12,
  "expiresAt": "2026-10-22T23:59:59.000Z",
  "createdAt": "2026-09-22T10:30:00.000Z",
  "updatedAt": "2026-09-22T10:30:00.000Z"
}
```

---

### 2.4 `matches` Collection
* **Document ID**: Deterministic composite key: `${candidateUserId}_${jobId}` (prevents duplicate match records).
* **Purpose**: Bipartite evaluation linking a candidate and job with score breakdowns and notification audit trails.

```json
{
  "id": "usr_98a7b6c5d4_job_react_dev_99",
  "candidateId": "usr_98a7b6c5d4",
  "jobId": "job_react_dev_99",
  "companyId": "comp_alpha123",
  "overallScore": 88.5,
  "breakdown": {
    "skillScore": 92.0,      // 60% weight
    "experienceScore": 90.0, // 25% weight
    "locationScore": 75.0    // 15% weight
  },
  "matchedMandatorySkills": ["react", "typescript"],
  "missingMandatorySkills": [],
  "matchedOptionalSkills": ["tailwindcss"],
  "stage": "discovered", // "discovered" | "applied" | "shortlisted" | "interviewing" | "rejected" | "hired"
  "notification": {
    "status": "notified_both", // "pending" | "notified_candidate" | "notified_employer" | "notified_both" | "failed"
    "candidateNotifiedAt": "2026-09-22T11:00:10.000Z",
    "candidateMessageSid": "SM9a8b7c6d5e",
    "employerNotifiedAt": "2026-09-22T11:00:15.000Z",
    "employerMessageSid": "SM1a2b3c4d5e"
  },
  "createdAt": "2026-09-22T11:00:00.000Z",
  "updatedAt": "2026-09-22T11:00:15.000Z"
}
```

---

## 3. Recommended Firestore Composite Indexes (`firestore.indexes.json`)

To prevent index starvation and ensure sub-100ms queries on large datasets, configure the following composite and collection group indexes:

```json
{
  "indexes": [
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "workMode", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "allNormalizedSkillKeys", "arrayConfig": "CONTAINS" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "jobs",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "candidateId", "order": "ASCENDING" },
        { "fieldPath": "overallScore", "order": "DESCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "jobId", "order": "ASCENDING" },
        { "fieldPath": "overallScore", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "matches",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "companyId", "order": "ASCENDING" },
        { "fieldPath": "notification.status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "candidateProfile.normalizedSkillKeys", "arrayConfig": "CONTAINS" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

---

## 4. Query Patterns Supported

| Business Use Case | Target Collection | Primary Filters & Orders |
| :--- | :--- | :--- |
| **Candidate Feed** | `jobs` | `where("status", "==", "active")`<br/>`where("allNormalizedSkillKeys", "array-contains-any", candidateSkills)`<br/>`orderBy("createdAt", "desc")` |
| **Employer Active Jobs** | `jobs` | `where("companyId", "==", companyId)`<br/>`where("status", "==", "active")`<br/>`orderBy("createdAt", "desc")` |
| **Candidate Match Inbox** | `matches` | `where("candidateId", "==", userId)`<br/>`orderBy("overallScore", "desc")` |
| **Employer Candidate Queue** | `matches` | `where("jobId", "==", jobId)`<br/>`where("overallScore", ">=", 70.0)`<br/>`orderBy("overallScore", "desc")` |
| **Skill Match Worker Evaluation** | `users` | `where("role", "==", "candidate")`<br/>`where("candidateProfile.normalizedSkillKeys", "array-contains-any", jobSkills)` |
