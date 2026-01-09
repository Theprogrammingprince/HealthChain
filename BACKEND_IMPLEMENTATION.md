# HealthChain Backend Implementation Guide

## Overview
This guide covers the complete backend implementation for user registration and data storage using Supabase.

---

## 📋 What Was Built

### 1. **Database Schema** (`database-schema.md`)
Complete SQL schema with three main tables:
- **users**: Core user authentication and profile data
- **patient_profiles**: Extended profile for patient role
- **hospital_profiles**: Extended profile for hospital role

Features:
- Row Level Security (RLS) policies
- Automatic timestamp updates via triggers
- Proper indexing for performance
- Foreign key relationships

### 2. **TypeScript Types** (`lib/database.types.ts`)
Comprehensive type definitions for:
- `UserProfile`, `PatientProfile`, `HospitalProfile`
- Insert types (for creating new records)
- Update types (for modifying existing records)
- Enum types for roles and providers

### 3. **Database Service Layer** (`lib/database.service.ts`)
CRUD operations for all entities:
- User profile management
- Patient profile management
- Hospital profile management
- Combined operations for complete profiles
- Helper functions for lookups by email/wallet

### 4. **API Routes**

#### `/api/auth/register` (POST)
Registers new users in the database.

**Request Body:**
```typescript
{
  userId: string;           // Required - UUID or wallet address
  email?: string;           // Optional - for OAuth users
  walletAddress?: string;   // Optional - for wallet users
  role: 'patient' | 'hospital'; // Required
  authProvider: 'google' | 'wallet'; // Required
  fullName?: string;
  avatarUrl?: string;
  
  // Patient-specific (optional)
  dateOfBirth?: string;
  gender?: string;
  bloodType?: string;
  phoneNumber?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  
  // Hospital-specific
  hospitalName?: string;    // Required if role is 'hospital'
  licenseNumber?: string;
  registrationNumber?: string;
  specialization?: string[];
  website?: string;
  description?: string;
}
```

**Success Response:**
```typescript
{
  success: true,
  message: "User registered successfully",
  data: {
    user: UserProfile,
    profile: PatientProfile | HospitalProfile
  }
}
```

#### `/api/auth/profile` (GET)
Retrieves complete user profile.

**Query Parameters:**
- `userId`: string (required)

**Success Response:**
```typescript
{
  success: true,
  data: {
    user: UserProfile,
    profile: PatientProfile | HospitalProfile | null
  }
}
```

### 5. **Enhanced Authentication Components**

#### **AuthButton** (`components/features/AuthButton.tsx`)
- Replaces WalletConnect in navbar
- Shows "Sign In / Sign Up" when not authenticated
- Shows user dropdown menu when authenticated
- Routes to `/signin` page

#### **Updated Auth Callback** (`app/auth/callback/page.tsx`)
Automatically handles:
1. OAuth session exchange
2. User registration in database (if new user)
3. Role assignment
4. Redirection based on role
5. Success/error notifications

#### **Updated WalletConnectButton** (`components/features/WalletConnectButton.tsx`)
Now includes:
1. Automatic user registration when wallet connects
2. Profile existence checking
3. Toast notifications
4. Error handling

---

## 🚀 Setup Instructions

### Step 1: Create Database Tables

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Open `database-schema.md` in this project
4. Copy and run each SQL section in order:
   - Users table
   - Patient profiles table
   - Hospital profiles table
   - Functions and triggers
   - Grant permissions

### Step 2: Verify Environment Variables

Ensure `.env.local` has:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_PROJECT_ID=your_reown_project_id
```

### Step 3: Enable Google OAuth (Optional)

1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Configure OAuth credentials
4. Set redirect URL to: `https://your-domain.com/auth/callback`

### Step 4: Test the Implementation

1. Start dev server: `npm run dev`
2. Click "Sign In / Sign Up" in navbar
3. Choose sign-in method (Google or Wallet)
4. Verify user is created in database
5. Check that redirect works correctly

---

## 📊 Data Flow

### Google OAuth Flow:
```
1. User clicks "Continue with Google"
   ↓
2. Redirected to Google OAuth
   ↓
3. Redirected to /auth/callback
   ↓
4. Callback checks if user exists in DB
   ↓
5. If new: POST /api/auth/register
   ↓
6. User profile created in database
   ↓
7. Redirect to dashboard/clinical based on role
```

### Wallet Connection Flow:
```
1. User clicks "Connect Wallet"
   ↓
2. Wallet modal opens (Reown AppKit)
   ↓
3. User connects MetaMask/WalletConnect
   ↓
4. WalletConnectButton checks if user exists
   ↓
5. If new: POST /api/auth/register
   ↓
6. User profile created in database
   ↓
7. Toast notification shown
```

---

## 🔒 Security Features

1. **Row Level Security (RLS)**
   - Users can only access their own data
   - Enforced at database level
   - Cannot be bypassed from frontend

2. **Type Safety**
   - Full TypeScript coverage
   - Compile-time error detection
   - IDE autocomplete support

3. **Input Validation**
   - API routes validate all inputs
   - Database constraints enforce data integrity
   - Proper error messages for debugging

4. **Authentication**
   - Supabase handles OAuth securely
   - Wallet signatures for blockchain auth
   - Session management built-in

---

## 🎯 Usage Examples

### Registering a Patient (Google OAuth)

```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: session.user.id,
    email: session.user.email,
    role: 'patient',
    authProvider: 'google',
    fullName: 'John Doe',
    avatarUrl: 'https://...
',
    phoneNumber: '+1234567890',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    bloodType: 'O+',
    city: 'New York',
    country: 'USA'
  })
});
```

### Registering a Hospital (Wallet)

```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    userId: walletAddress,
    walletAddress: walletAddress,
    role: 'hospital',
    authProvider: 'wallet',
    hospitalName: 'City General Hospital',
    licenseNumber: 'LIC12345',
    specialization: ['Cardiology', 'Neurology'],
    city: 'Boston',
    country: 'USA'
  })
});
```

### Fetching User Profile

```typescript
const response = await fetch(`/api/auth/profile?userId=${userId}`);
const data = await response.json();

if (data.success) {
  const { user, profile } = data.data;
  console.log('User:', user);
  console.log('Profile:', profile);
}
```

### Using Database Service Functions

```typescript
import { getUserProfile, updatePatientProfile } from '@/lib/database.service';

// Get user
const user = await getUserProfile(userId);

// Update patient profile
await updatePatientProfile(userId, {
  phone_number: '+1234567890',
  address: '123 Main St'
});
```

---

## 🔧 Customization

### Adding New Fields to Patient Profile

1. Update database schema:
```sql
ALTER TABLE public.patient_profiles 
ADD COLUMN new_field TEXT;
```

2. Update TypeScript types in `lib/database.types.ts`:
```typescript
export interface PatientProfile {
  // ... existing fields
  new_field?: string | null;
}
```

3. Update API route to accept new field
4. Update forms to collect the data

### Creating Additional API Routes

Example: Update profile endpoint
```typescript
// app/api/auth/update-profile/route.ts
export async function PATCH(request: NextRequest) {
  const { userId, updates } = await request.json();
  const result = await updateUserProfile(userId, updates);
  return NextResponse.json({ success: true, data: result });
}
```

---

## 🐛 Troubleshooting

### Issue: "User not found" error
**Solution:** Ensure user was created during OAuth callback or wallet connection

### Issue: RLS policy blocking queries
**Solution:** Verify that `auth.uid()` matches the user ID being queried

### Issue: Foreign key constraint error
**Solution:** Ensure user record exists before creating patient/hospital profile

### Issue: "Provider is not enabled" error
**Solution:** Enable Google provider in Supabase Auth settings

---

## 📈 Next Steps

1. **Add More Profile Fields**: Extend patient/hospital profiles as needed
2. **Implement Profile Editing**: Create forms for users to update their data
3. **Add Medical Records**: Create tables for health records, appointments, etc.
4. **Implement Search**: Add functionality to find hospitals/doctors
5. **Add File Uploads**: Store medical documents, images, etc.
6. **Create Admin Panel**: Manage users, verify hospitals, etc.

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## ✅ Checklist

- [x] Database schema created
- [x] TypeScript types defined
- [x] Database service layer implemented
- [x] Registration API route created
- [x] Profile retrieval API route created
- [x] Auth callback updated
- [x] Wallet connection updated
- [x] Navbar auth button created
- [ ] Test OAuth flow
- [ ] Test wallet connection flow
- [ ] Verify data persistence
- [ ] Add profile editing UI
- [ ] Implement error logging
