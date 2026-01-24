# Lint Fixes Tracking

## Summary
- **Starting**: 154 problems (52 errors, 102 warnings)
- **Current**: 137 problems (44 errors, 93 warnings)
- **Fixed**: 17 problems (8 errors, 9 warnings)

## Fixes Completed

### 1. ✅ app/admin/dashboard/notifications/page.tsx
- Removed unused `Check` and `Clock` imports
- Escaped apostrophe in JSX

### 2. ✅ app/patient/dashboard/notifications/page.tsx  
- Fixed `Date.now()` purity errors by moving notification generation to external function
- Removed unused `useState` import

### 3. ✅ components/dashboard/DocumentUploadDialog.tsx
- Fixed `Math.random()` and `Date.now()` purity errors by extracting to separate variables
- Fixed `error: any` type to `error: unknown`

### 4. ✅ components/dashboard/GrantAccessDialog.tsx
- Removed unused `Select` component imports
- Fixed `selectedEntity: any` type to proper union type with type guards
- Escaped quotes in JSX

### 5. ✅ app/admin/dashboard/page.tsx
- Fixed `icon: any` type to `React.ComponentType`
- Updated StatCard to properly render Icon component

### 6. ✅ components/dashboard/RecordEntryForm.tsx
- Fixed `Math.random()` and `Date.now()` purity errors by extracting to variables

## Critical Issues Remaining

### Purity Errors (0 remaining - all fixed!)
- [x] RecordEntryForm.tsx - Math.random/Date.now  
- [x] DocumentUploadDialog.tsx - Math.random/Date.now
- [x] app/patient/dashboard/notifications/page.tsx - Date.now

### High Priority
- [ ] PatientSearchBar.tsx - setState in effect (cascading renders)
- [ ] Multiple files - Unescaped entities (apostrophes and quotes)
- [ ] Multiple files - `any` types need proper typing

### Medium Priority  
- [ ] Unused imports and variables across many files
- [ ] Missing useEffect dependencies

## Files Still Needing Fixes

### Errors (44 remaining)
1. app/admin/dashboard/settings/page.tsx - `any` type
2. app/api/auth/profile/route.ts - `any` types
3. app/api/auth/register/route.ts - `any` types (2x)
4. app/api/email/verification-status/route.ts - `any` type
5. app/auth/callback/page.tsx - `any` types (2x)
6. app/auth/page.tsx - `any` type
7. app/clinical/dashboard/settings/page.tsx - unescaped entity
8. app/clinical/verify/page.tsx - unescaped entity
9. components/admin/HospitalVerificationTable.tsx - `any` types (2x)
10. components/dashboard/ActivityLogTable.tsx - `any` type
11. components/dashboard/HospitalDashboardGuard.tsx - unescaped entity
12. components/dashboard/PatientSearchBar.tsx - setState in effect
13. components/dashboard/ProfileSetupDialog.tsx - `any` type
14. components/features/EmailAuthForm.tsx - `any` type + unescaped entities (3x)
15. components/features/RequireAuth.tsx - `any` type
16. components/features/RoleSelectionModal.tsx - unescaped entities (2x)
17. components/features/WalletConnectButton.tsx - `any` type
18. components/guardian/GuardianDashboard.tsx - unescaped entities (3x)
19. hooks/useRegistry.ts - `any` type
20. lib/store.ts - `any` types (2x)
21. lib/validation.ts - `any` types (3x)
22. app/patient/dashboard/permissions/page.tsx - `any` types (2x)

### Warnings (93 remaining)
- Unused imports and variables
- Missing useEffect dependencies
- Using `<img>` instead of `<Image />`

## Next Steps
1. Fix setState-in-effect error in PatientSearchBar
2. Fix unescaped entities (simple regex replacements)
3. Address `any` types where practical
4. Clean up unused imports 
