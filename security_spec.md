# Security Specification (Phase 0: Payload-First Security TDD)

## 1. Data Invariants
- **Identity Integrity**: Users can only write to their own profile document `/users/{userId}` where `{userId}` strictly matches `request.auth.uid`.
- **Badge Record Integrity**: Badges under `/users/{userId}/badges/{badgeId}` must have `userId == request.auth.uid`, must use valid identifier formats (`isValidId`), and cannot be manipulated by third parties.
- **Role Elevation Guard**: Users cannot promote themselves to 'admin' or alter immutable creation timestamps (`createdAt`).
- **Verified Email Requirement**: High-privilege writes require `request.auth.token.email_verified == true`.
- **Default Deny**: All unmapped paths must be strictly blocked by the global catch-all rule `match /{document=**} { allow read, write: if false; }`.

## 2. The Dirty Dozen Payloads (Designed to be Rejected)
1. **Ghost Field Attack**: Injecting `{ isSuperAdmin: true }` into `/users/{userId}`.
2. **Identity Spoofing**: User A creating a badge in `/users/{UserB}/badges/badge-1`.
3. **Invalid ID Injection**: Passing a 2KB junk character string as `badgeId`.
4. **Self-Promotion**: Non-admin user attempting to set `role = 'admin'` during user profile update.
5. **Unverified Token Attack**: Write attempt with `request.auth.token.email_verified = false`.
6. **Cross-Tenant Mutation**: Attempting to delete another student's exam submission records.
7. **Blanket Read Scraping**: Attempting to query `collectionGroup('badges')` without user ownership filters.
8. **Negative Milestone Metric**: Setting `totalExamsCompleted: -5` or `topScaledScore: 99999`.
9. **Missing Required Fields**: Creating a badge record without `title`, `tier`, or `unlockedAt`.
10. **Tampering with Immutable Creation**: Modifying `createdAt` or `joinedAt` on document update.
11. **Excessive String Payload**: Injecting 50KB strings into `title` or `name` field (violating `maxLength`).
12. **Anonymous Write Exploit**: Anonymous unauthenticated client attempting to write to `/users/{userId}`.

All 12 attacks are strictly rejected by the hardened rules in `firestore.rules`.
