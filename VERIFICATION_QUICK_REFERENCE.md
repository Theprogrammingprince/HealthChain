# Hospital Verification Status - Quick Reference

## Status Types

### 1. PENDING ⏳
```
┌─────────────────────────────────────────────────────────┐
│ 🟡 PENDING VERIFICATION                                 │
│ Your account is under review. You can only access       │
│ Settings until verification is complete.               │
└─────────────────────────────────────────────────────────┘
```
**What hospitals can do:**
- ✅ Access Settings page
- ✅ Update hospital profile
- ❌ Cannot access main dashboard
- ❌ Cannot search patients
- ❌ Cannot manage staff

---

### 2. VERIFIED ✅
```
┌─────────────────────────────────────────────────────────┐
│ 🟢 VERIFIED                                             │
│ Your hospital account is fully verified and active.    │
└─────────────────────────────────────────────────────────┘
```
**What hospitals can do:**
- ✅ Full dashboard access
- ✅ Patient search and records
- ✅ Staff management
- ✅ All clinical features
- ✅ Settings page

---

### 3. REJECTED ❌
```
┌─────────────────────────────────────────────────────────┐
│ 🔴 VERIFICATION REJECTED                                │
│ Your verification was rejected. Please update your      │
│ information and resubmit.                               │
│                                                         │
│ ⚠️ Reason: Invalid CAC registration number             │
└─────────────────────────────────────────────────────────┘
```
**What hospitals can do:**
- ✅ Access Settings page
- ✅ Resubmit verification
- ✅ View rejection reason
- ❌ Cannot access main dashboard

---

## User Flow Diagram

```
┌─────────────────┐
│  Hospital Signs │
│      Up         │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Submit Docs    │
│  (CAC, MDCN)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  Redirected to Dashboard                │
│  Status: PENDING 🟡                     │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  Access Restricted                │ │
│  │  Only Settings Available          │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Admin Reviews  │
│  Application    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌────────┐ ┌──────────┐
│APPROVE │ │ REJECT   │
└───┬────┘ └────┬─────┘
    │           │
    ▼           ▼
┌─────────┐ ┌──────────────────┐
│VERIFIED │ │ REJECTED         │
│   🟢    │ │    🔴            │
│         │ │                  │
│Full     │ │Can resubmit      │
│Access   │ │with corrections  │
└─────────┘ └──────────────────┘
```

---

## Header Display Examples

### Desktop View (Verified)
```
┌──────────────────────────────────────────────────────────────────┐
│ 🏥 HealthChain    [Mayo Clinic]    🟢 VERIFIED    👤 Dr. House   │
└──────────────────────────────────────────────────────────────────┘
```

### Desktop View (Pending)
```
┌──────────────────────────────────────────────────────────────────┐
│ 🏥 HealthChain    [Mayo Clinic]    🟡 PENDING    👤 Dr. House    │
│                                    (Under Review)                │
└──────────────────────────────────────────────────────────────────┘
```

### Mobile View (Pending)
```
┌────────────────────────────────────┐
│ 🏥 HealthChain      👤 Dr. House   │
├────────────────────────────────────┤
│ 🟡 PENDING VERIFICATION            │
│ Your account is under review...    │
└────────────────────────────────────┘
```

---

## Navigation Menu

### Unverified Hospital
```
┌─────────────────────┐
│ 👤 Dr. House        │
│ Clinical Session    │
├─────────────────────┤
│ ⚙️  Hospital Settings│ ← Only accessible option
├─────────────────────┤
│ 🚪 End Shift        │
└─────────────────────┘
```

### Verified Hospital
```
┌─────────────────────┐
│ 👤 Dr. House        │
│ Clinical Session    │
├─────────────────────┤
│ ⚙️  Hospital Settings│ ← All options available
├─────────────────────┤
│ 🚪 End Shift        │
└─────────────────────┘
```

---

## Settings Page Access

**URL**: `/clinical/settings`

**Accessible by**: ✅ All hospitals (verified or unverified)

**Features**:
- Update hospital name
- Contact information (phone, website)
- Address details
- Hospital description
- Shows verification status in header

---

## Key Files

| File | Purpose |
|------|---------|
| `components/dashboard/VerificationStatusBanner.tsx` | Status badge component |
| `components/dashboard/HospitalDashboardGuard.tsx` | Access control wrapper |
| `app/clinical/page.tsx` | Main dashboard (requires verification) |
| `app/clinical/settings/page.tsx` | Settings (no verification required) |
| `app/clinical/verify/page.tsx` | Verification submission page |

---

## Database Fields

**Table**: `hospital_profiles`

| Field | Type | Values |
|-------|------|--------|
| `verification_status` | TEXT | 'pending', 'verified', 'rejected' |
| `rejection_reason` | TEXT | Admin's rejection message (nullable) |

---

## Testing Quick Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Check for TypeScript errors
npx tsc --noEmit
```

---

**Pro Tip**: When testing, you can manually update the `verification_status` in Supabase to see different states without waiting for admin approval!
