# Security Spec

## Data Invariants
1. A service record must have a valid `userId` exactly matching `request.auth.uid`.
2. A service record's `serviceType` must be one of: 'BLOQUEIO', 'TELEMETRIA', 'ALARME', 'OUTROS'.
3. Only verified admins (specifically alexs.passos3@gmail.com and master@trackerpro.com) can create or delete service records.
4. Users can only read records, actually everyone authenticated could potentially list them if allowed, but perhaps we should restrict reads to authenticated users.

## The "Dirty Dozen" Payloads
1. **Missing `userId`**: Document creation missing the userId field.
2. **Invalid `userId`**: Document creation where `userId` does not match `request.auth.uid`.
3. **Invalid `serviceType`**: Document creation with `serviceType` as 'HACK'.
4. **Invalid strings**: Strings exceeding 10MB (Denial of Wallet).
5. **No Auth**: Unauthenticated user trying to read/write.
6. **Ghost field**: Adding `isVerified: true` on creation.
7. **Type tampering**: Number instead of string for `serviceType`.
8. **Admin escalation**: Trying to modify `createdAt` during update.
9. **Update missing validator**: Trying to bypass valid updates.
10. **Spoof Email Read**: Trying to read lists with spoofed unverified email.

## Test Runner
Defined in `firestore.rules.test.ts`.
