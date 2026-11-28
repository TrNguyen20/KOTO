# KOTO Firestore Security Specification

## 1. Data Invariants
1. A non-admin user can never create or update their `users/{userId}` document with `role == 'admin'` or `status == 'active'`.
2. Every newly registered user (including the bootstrapped admin `trung.persie96@gmail.com`) must start with `completedLessonsCount == 0` and zero initial progress.
3. User PII (`email`, `photoURL`) resides exclusively under `/users/{userId}/private/info` and can only be read by the document owner or an active Admin.
4. Only `active` users (or Admins) may persist learning progress updates under `/users/{userId}/progress/main`.
5. Only active Admins may list all users, alter another user's `role`/`status`, or read/write `/adminConfig/{docId}`.
6. All timestamps (`createdAt`, `updatedAt`, `lastLoginAt`) on Firestore writes must match `request.time`.

## 2. Adversarial Payloads ("Dirty Dozen")
1. Self-escalation on signup (`role: "admin"`, `status: "active"` from non-admin email) -> DENIED.
2. Self-approval on update (`status: "active"` by `student` user) -> DENIED.
3. Unverified email claim (`email_verified: false` claiming admin email) -> DENIED.
4. Cross-user read of `/users/otherUid/private/info` by student -> DENIED.
5. Cross-user write to `/users/otherUid/progress/main` by student -> DENIED.
6. Suspended user attempting to update `/users/selfUid/progress/main` -> DENIED.
7. Pending user attempting to write `/users/selfUid/progress/main` progress updates -> DENIED.
8. Shadow field injection (`extraAdminFlag: true`) on `users/{userId}` or `progress/main` -> DENIED via `hasOnly`.
9. Oversized ID or string (`displayName` > 120 chars or invalid path ID) -> DENIED.
10. Client-forged timestamp (`updatedAt: "1999-01-01"`) -> DENIED via `request.time`.
11. Unbounded array injection (`completedLessons` size > 50 or `srsQueue` > 500) -> DENIED.
12. Student attempting to read/write `/adminConfig/sheets` -> DENIED.
