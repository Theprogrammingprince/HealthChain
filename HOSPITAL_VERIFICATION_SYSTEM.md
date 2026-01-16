# Hospital Verification Status System

## Overview

This system implements a comprehensive verification workflow for hospitals signing up on the HealthChain platform. Hospitals must complete verification before accessing full dashboard features.

## Features

### 1. **Verification Status Display**
- **Status Badge in Header**: Shows current verification status (Pending, Verified, Rejected)
- **Color-Coded Indicators**:
  - 🟡 **Pending**: Yellow - Account under review
  - 🟢 **Verified**: Green - Full access granted
  - 🔴 **Rejected**: Red - Verification denied with reason

### 2. **Access Control**
- **Unverified Hospitals** can only access:
  - ✅ Settings page (`/clinical/settings`)
  - ✅ Verification page (`/clinical/verify`)
  
- **Verified Hospitals** have full access to:
  - ✅ Clinical Dashboard (`/clinical`)
  - ✅ Patient Search
  - ✅ Record Entry
  - ✅ Staff Management
  - ✅ All other features

### 3. **User Experience Flow**

#### New Hospital Signup
1. Hospital signs up via `/signup` or `/clinical/verify`
2. Submits verification documents (CAC, MDCN license)
3. Redirected to clinical dashboard
4. Sees "Pending" status banner in header
5. Dashboard shows access restriction message
6. Can only navigate to Settings

#### During Pending Status
- Header displays: **"Pending Verification"** badge
- Message: "Your account is under review. You can only access Settings until verification is complete."
- Access to main dashboard features is blocked
- Can update hospital profile in Settings

#### After Admin Approval
- Status changes to **"Verified"**
- Full dashboard access granted
- Green verification badge displayed
- Email notification sent (if configured)

#### If Rejected
- Status changes to **"Rejected"**
- Red badge with rejection reason displayed
- Can resubmit verification from `/clinical/verify`
- Settings remain accessible

## Components

### 1. `VerificationStatusBanner.tsx`
**Location**: `components/dashboard/VerificationStatusBanner.tsx`

Displays the current verification status with appropriate styling.

**Props**:
```typescript
interface VerificationStatusBannerProps {
    status: "pending" | "verified" | "rejected";
    rejectionReason?: string | null;
}
```

**Features**:
- Animated icons (pulsing for pending)
- Color-coded backgrounds and borders
- Displays rejection reason if applicable
- Responsive design (hidden on mobile, shown in separate section)

### 2. `HospitalDashboardGuard.tsx`
**Location**: `components/dashboard/HospitalDashboardGuard.tsx`

Wrapper component that enforces verification-based access control.

**Props**:
```typescript
interface HospitalDashboardGuardProps {
    children: ReactNode;
    allowedForUnverified?: boolean; // Default: false
}
```

**Features**:
- Checks hospital verification status from database
- Blocks access to restricted pages for unverified hospitals
- Shows custom access denied screen with helpful information
- Provides navigation to Settings and Verification pages
- Loading state with skeleton UI

**Usage**:
```tsx
// For pages requiring verification
<HospitalDashboardGuard allowedForUnverified={false}>
  <YourDashboardContent />
</HospitalDashboardGuard>

// For pages accessible to unverified hospitals (e.g., Settings)
<HospitalDashboardGuard allowedForUnverified={true}>
  <SettingsPage />
</HospitalDashboardGuard>
```

### 3. Hospital Settings Page
**Location**: `app/clinical/settings/page.tsx`

Accessible regardless of verification status.

**Features**:
- Update hospital name
- Contact information (phone, website)
- Address details (street, city, state, country, postal code)
- Hospital description
- Shows verification status banner in header
- Form validation with Zod
- Auto-saves to `hospital_profiles` table

## Database Schema

### `hospital_profiles` Table

Required columns for verification system:
```sql
- user_id: UUID (Foreign key to users table)
- hospital_name: TEXT
- verification_status: TEXT ('pending' | 'verified' | 'rejected')
- rejection_reason: TEXT (nullable)
- registration_number: TEXT (CAC number)
- license_number: TEXT (MDCN license)
- license_path: TEXT (URL to uploaded certificate)
- phone_number: TEXT
- address: TEXT
- city: TEXT
- state: TEXT
- country: TEXT
- postal_code: TEXT
- website: TEXT
- description: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Implementation Details

### Clinical Dashboard (`/clinical`)

**Updated Features**:
1. **Header Enhancement**:
   - Verification status banner (desktop: inline, mobile: separate row)
   - Settings menu item in user dropdown
   - Responsive layout adjustments

2. **Access Control**:
   - Wrapped with `HospitalDashboardGuard`
   - `allowedForUnverified={false}` - requires verification
   - Loads verification status on mount
   - Updates UI based on status

3. **State Management**:
```typescript
const [verificationStatus, setVerificationStatus] = useState<"pending" | "verified" | "rejected" | null>(null);
const [rejectionReason, setRejectionReason] = useState<string | null>(null);
```

### Verification Page (`/clinical/verify`)

**Updated Behavior**:
- After successful submission, redirects to `/clinical` after 2 seconds
- Shows toast notification with redirect message
- Pre-fills form if resubmitting after rejection

## Admin Integration

The admin can manage hospital verification through the existing admin dashboard:

1. **View Pending Hospitals**: `/admin/verify`
2. **Approve/Reject**: Update `verification_status` in `hospital_profiles`
3. **Add Rejection Reason**: Populate `rejection_reason` field when rejecting
4. **Email Notifications**: Trigger via `/api/email/verification-status`

## Styling & Design

### Color Scheme
- **Pending**: Yellow (`#FBBF24`) with pulsing animation
- **Verified**: Emerald (`#10B981`) 
- **Rejected**: Red (`#EF4444`)

### Responsive Breakpoints
- **Desktop (xl+)**: Status banner inline in header
- **Mobile/Tablet**: Status banner in separate row below header

### Animations
- Pending status: Pulsing icon animation
- Page transitions: Fade in/scale up
- Smooth hover effects on interactive elements

## Testing Checklist

- [ ] New hospital can sign up and submit verification
- [ ] Pending status displays correctly in header
- [ ] Unverified hospital cannot access main dashboard
- [ ] Unverified hospital CAN access Settings page
- [ ] Settings page loads and saves data correctly
- [ ] Admin can approve hospital
- [ ] Verified status displays correctly
- [ ] Verified hospital has full dashboard access
- [ ] Admin can reject hospital with reason
- [ ] Rejected status shows rejection reason
- [ ] Rejected hospital can resubmit verification
- [ ] Mobile responsive design works correctly
- [ ] All animations and transitions work smoothly

## Future Enhancements

1. **Email Notifications**
   - Send email when status changes
   - Include rejection reason in rejection email
   - Reminder emails for pending applications

2. **Document Management**
   - View uploaded certificates in Settings
   - Re-upload documents without full resubmission
   - Document expiry tracking

3. **Multi-step Verification**
   - Additional verification steps (bank details, etc.)
   - Progress indicator for verification process

4. **Analytics**
   - Track average verification time
   - Monitor rejection reasons
   - Hospital onboarding funnel metrics

## Troubleshooting

### Issue: Status not updating after admin approval
**Solution**: Check that the admin is updating the `verification_status` field in the `hospital_profiles` table, not just the `users` table.

### Issue: Guard component showing loading indefinitely
**Solution**: Verify that the hospital has a record in the `hospital_profiles` table with a valid `user_id`.

### Issue: Settings page not accessible
**Solution**: Ensure the Settings page is wrapped with `<HospitalDashboardGuard allowedForUnverified={true}>`.

## Related Files

- `components/dashboard/VerificationStatusBanner.tsx`
- `components/dashboard/HospitalDashboardGuard.tsx`
- `app/clinical/page.tsx`
- `app/clinical/settings/page.tsx`
- `app/clinical/verify/page.tsx`
- `app/admin/verify/page.tsx` (Admin verification management)

---

**Last Updated**: January 16, 2026
**Version**: 1.0.0
