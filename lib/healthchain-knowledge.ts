/**
 * HealthChain Knowledge Base
 * 
 * This is the chatbot's "brain" — a comprehensive document describing
 * everything about HealthChain. The AI model uses this as context to
 * answer user questions intelligently.
 * 
 * HOW TO TRAIN THE CHATBOT:
 * Simply add more information to the HEALTHCHAIN_KNOWLEDGE string below.
 * The more detailed and accurate the information, the better the chatbot
 * will answer questions. Structure it clearly with headers and bullet points.
 * 
 * The AI can answer ANY question as long as the answer exists somewhere
 * in this document. If the information isn't here, it will gracefully
 * say it doesn't know.
 */

export const HEALTHCHAIN_KNOWLEDGE = `
# HealthChain — Complete Knowledge Base

## What is HealthChain?
HealthChain is a blockchain-powered, patient-owned health records platform. It gives individuals full control over their medical data while enabling secure sharing with healthcare providers, hospitals, and emergency services. Think of it as your personal medical vault — encrypted, decentralized, and accessible anywhere in the world.

HealthChain was built to solve the fundamental problem of fragmented medical records. Today, your health data is scattered across dozens of hospitals, clinics, labs, and pharmacies — none of which talk to each other. HealthChain unifies all of that into one secure, patient-controlled platform.

## Core Mission
"Save lives. Own your data." — HealthChain exists to ensure that every person on earth has instant, secure access to their complete medical history, regardless of where they are or which hospital they visit.

## Key Features

### 1. Patient Dashboard
- View all your medical records in one place
- Upload documents (lab results, prescriptions, imaging, clinical notes)
- Track your vitals: blood type, genotype, weight, height, blood pressure, glucose, BMI
- Manage allergies, chronic conditions, and current medications
- View activity logs — see who accessed your records and when
- Personal identity verification with passport photo upload
- Emergency SOS mode for life-threatening situations

### 2. Medical Records Management
- **Laboratory Results**: Blood tests, urinalysis, metabolic panels, CBC, lipid profiles
- **Radiology/Imaging**: X-rays, MRIs, CT scans, ultrasounds
- **Prescriptions/Pharmacy**: Medication records, dosage instructions, refill history
- **Clinical Notes**: Doctor visit summaries, treatment plans, progress notes
- **General Documents**: Discharge summaries, referral letters, vaccination records
- All records are encrypted with AES-256 before upload
- Files are stored on IPFS (InterPlanetary File System) — decentralized and tamper-proof
- Each record gets a unique IPFS hash for verification

### 3. Access Control & Permissions
- **You decide who sees your data** — no one can access it without your explicit consent
- Grant access at different levels:
  - View Summary: Basic health info only (blood type, allergies, conditions)
  - View Records: Full access to medical documents
  - Emergency Access: Time-limited access during emergencies
  - Full Access: Complete access to all data and history
- Revoke access instantly with one click
- Every access event is logged on the blockchain — full transparency
- Generate one-time access codes for new providers' 
- Share with specific doctors, hospitals, or individuals

### 4. Emergency Mode (SOS)
- Activate in life-threatening situations with one button press
- Instantly notifies all designated emergency contacts and guardians
- Temporarily grants access to critical medical data:
  - Blood type and genotype
  - Known allergies (especially drug allergies)
  - Chronic conditions
  - Current medications
  - Emergency contact information
- Time-limited access (auto-expires after the emergency period)
- Can save lives when you're unconscious or unable to communicate
- Emergency responders and ER doctors can see what they need to treat you safely

### 5. Blockchain Verification
- Every record upload, access grant, and access revocation is logged as a transaction
- Transactions are immutable — they cannot be altered or deleted
- Provides a complete audit trail for legal and medical compliance
- Ensures data integrity — records cannot be tampered with
- Transaction hashes serve as proof of authenticity

### 6. Identity Verification
- Passport/ID photo upload for identity verification
- Profile image syncs across the dashboard
- Ensures the person managing the records is the actual patient

## User Roles

### Patient
- The primary user who owns and controls their health data
- Can upload records, manage permissions, view history, trigger emergency mode
- Has a full dashboard with vitals, records, activity logs, and settings
- Can update personal information and medical profile

### Doctor
- Healthcare professionals affiliated with verified hospitals
- Can view patient records (with patient consent)
- Can add diagnoses, clinical notes, and lab results to patient records
- Must be verified through their affiliated hospital
- Can request hospital transfer
- Doctor verification status (pending, verified, revoked) determines access level

### Hospital
- Healthcare facilities that register and get verified on the platform
- Manage their staff (doctors, nurses, admins)
- Handle patient encounters and medical record submissions
- Must be verified by HealthChain admin before operating
- Can manage clinical workflows and patient care

### Admin
- HealthChain platform administrators
- Verify or reject hospital registration applications
- Monitor platform compliance and security
- Manage paymaster balance for transaction subsidies
- View system-wide analytics

## Security & Privacy

### Encryption
- **AES-256 Encryption**: Military-grade encryption for all stored data
- Data is encrypted before it leaves your device
- Only you (and those you authorize) hold the decryption keys
- Even HealthChain itself cannot read your unencrypted data

### Decentralized Storage (IPFS)
- Files are distributed across multiple nodes worldwide
- No single point of failure — if one node goes down, your data is still safe
- Content-addressed storage — files are identified by their content hash, not location
- Tamper-proof — any modification changes the hash, immediately detectable

### Blockchain Security
- Immutable audit trail on the blockchain
- Every action (upload, access, revocation) is recorded as a transaction
- Cannot be altered or deleted after the fact
- Provides transparency and accountability

### Compliance
- **HIPAA Compliant**: Meets US healthcare data protection standards
- **GDPR Compliant**: Meets EU data privacy regulations
- End-to-end encryption
- Consent-based data sharing
- Right to data portability
- Complete data erasure (right to be forgotten)

### Zero-Knowledge Architecture
- HealthChain operates on a zero-knowledge principle
- The platform never has access to your unencrypted data
- Your encryption keys stay with you
- We cannot be compelled to hand over readable data because we don't have it

## How It Works (Step by Step)

### For Patients
1. **Sign Up**: Create an account with email or Google authentication
2. **Choose Your Role**: Select "Patient" during registration
3. **Complete Your Profile**: Add personal info, vitals, emergency contacts
4. **Upload Documents**: Scan or photograph your existing medical records
5. **Verify Identity**: Upload a passport photo for identity verification
6. **Manage Access**: Grant or revoke access to doctors and hospitals as needed
7. **Stay Protected**: Your data is encrypted, stored on IPFS, and verified on-chain

### For Doctors
1. **Register**: Sign up and select "Doctor" role
2. **Hospital Affiliation**: Link to your verified hospital
3. **Get Verified**: Your hospital confirms your credentials
4. **Access Patients**: Request access through the patient's consent system
5. **Add Records**: Submit diagnoses, clinical notes, and lab results
6. **Transfer**: Request hospital transfer if changing workplaces

### For Hospitals
1. **Register**: Sign up with hospital details (name, license, address)
2. **Submit for Verification**: HealthChain admin reviews your application
3. **Get Approved**: Receive verification status to begin operating
4. **Manage Staff**: Add doctors, nurses, and administrative staff
5. **Handle Patients**: Process encounters and medical records
6. **Maintain Compliance**: Keep your license and credentials up to date

## Technical Architecture

### Frontend
- Built with **Next.js 14** (React framework)
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Shadcn UI** component library
- Responsive design for all screen sizes

### Backend
- **Supabase** for authentication, database, and real-time features
- **PostgreSQL** database with Row Level Security (RLS)
- **IPFS** for decentralized file storage
- **Blockchain** integration for transaction verification
- RESTful API routes for server-side operations

### Database
- User profiles, patient profiles, doctor profiles, hospital profiles
- Medical records with IPFS hashes
- Access permissions with fine-grained levels
- Activity logs with full audit trail
- Notifications system
- Support ticket system

## Pricing
- **Patients**: Free to use. We believe everyone deserves secure access to their health records.
- **Doctors**: Free through their affiliated hospital.
- **Hospitals**: Custom pricing based on size and needs. Contact our team for a quote.
- **Enterprise**: Custom solutions for large healthcare networks. Includes dedicated support, custom integrations, and SLA guarantees.

## Support
- **In-Dashboard Support**: Registered users can create support tickets directly from the dashboard. Our team responds within 24 hours.
- **Contact Page**: Visit the contact page for general inquiries.
- **FAQ**: Common questions and answers are available on the FAQ page.
- **Email**: Reach out directly for urgent matters.
- **Community**: Join our community for discussions and updates.

## Frequently Asked Questions

### General
**Q: Is my data really private?**
A: Yes. Your data is encrypted with AES-256 before it leaves your device. Even HealthChain cannot read your unencrypted data. Only you and those you explicitly authorize can access it.

**Q: What happens if HealthChain goes down?**
A: Your data is stored on IPFS, a decentralized storage network. Even if HealthChain's servers are temporarily unavailable, your data remains safe and accessible through the IPFS network.

**Q: Can HealthChain sell my data?**
A: Absolutely not. We use a zero-knowledge architecture, which means we cannot even read your data. Your medical records are yours and yours alone.

**Q: Is HealthChain a replacement for my doctor?**
A: No. HealthChain is a records management platform, not a medical service. Always consult with qualified healthcare professionals for medical advice, diagnoses, and treatment.

**Q: Can I delete my account?**
A: Yes. Under GDPR's "right to be forgotten," you can request complete deletion of your account and all associated data.

### Security
**Q: What if I lose my password?**
A: You can reset your password through email verification. Your encrypted data remains safe as encryption keys are derived securely.

**Q: Has HealthChain ever been hacked?**
A: HealthChain uses military-grade encryption and decentralized storage. Our zero-knowledge architecture means that even in the unlikely event of a breach, attackers would only find encrypted, unreadable data.

**Q: Who can see my records?**
A: Only you and people you explicitly grant access to. Every access event is logged on the blockchain for complete transparency.

### Records
**Q: What file types can I upload?**
A: We support PDF, JPEG, PNG, and DICOM formats. Most medical documents and imaging files are supported.

**Q: Is there a storage limit?**
A: Patients get generous storage for their records. There is no practical limit for typical medical document usage.

**Q: Can I upload records from any hospital?**
A: Yes. You can upload records from any healthcare provider worldwide. Simply scan or photograph your documents.

### Access
**Q: How do I share records with a new doctor?**
A: Go to Permissions in your dashboard, click "Grant Access," enter the provider's details, and choose the access level. You can also generate a one-time access code.

**Q: Can I see who accessed my records?**
A: Yes. The Activity Log in your dashboard shows every access event with the accessor's identity, timestamp, and action performed.

**Q: What is Emergency Access?**
A: Emergency Access is a time-limited, automatically-expiring access grant activated during medical emergencies. It shares critical info (blood type, allergies, medications) with emergency responders.

### Doctors & Hospitals
**Q: How does a doctor get verified?**
A: Doctors register with their hospital affiliation. The hospital confirms their credentials, and they receive verified status, enabling them to access patient records (with consent).

**Q: Can a doctor transfer to another hospital?**
A: Yes. Doctors can request a transfer from their profile. The new hospital must approve the transfer request. The doctor's verification status resets to "pending" until the new hospital confirms.

**Q: What does hospital verification involve?**
A: Hospitals submit their license, accreditation details, and contact information. HealthChain's admin team reviews the application and either approves or rejects it, with reasons provided for rejections.

## Contact Information
- **Website**: healthchain.io
- **Twitter/X**: @healthchainorg
- **Support**: Available through the dashboard or contact page
- **Location**: Global — accessible from anywhere

## Legal
- HealthChain is committed to compliance with all applicable healthcare data regulations
- Our platform follows HIPAA (Health Insurance Portability and Accountability Act) guidelines
- We comply with GDPR (General Data Protection Regulation) for EU users
- Terms of Service and Privacy Policy are available on the website
- Data processing agreements available for healthcare providers

## About the Team
HealthChain was founded by a team passionate about healthcare innovation and data sovereignty. Our mission is to ensure that every person has secure, instant access to their complete medical history — saving lives through better data availability.
`;

/**
 * System prompt that instructs the AI how to behave.
 * This defines the chatbot's personality and boundaries.
 */
export const CHATBOT_SYSTEM_PROMPT = `You are HealthChain Assistant, the official AI chatbot for the HealthChain platform. Your job is to answer user questions about HealthChain accurately, helpfully, and conversationally.

RULES:
1. ONLY answer questions based on the HealthChain knowledge provided below. Do not make up information.
2. If a question is not covered in the knowledge base, say: "I don't have specific information about that, but our support team can help! You can reach them through the Contact page or the in-dashboard Support Center."
3. Keep responses concise but thorough. Use bullet points and bold text for readability.
4. Be friendly, professional, and encouraging. Use occasional emojis but don't overdo it.
5. NEVER provide medical advice, diagnoses, or treatment recommendations. Always direct users to consult healthcare professionals.
6. If someone asks about competitors or other platforms, stay focused on HealthChain's strengths without disparaging others.
7. For pricing questions about hospitals/enterprise, encourage them to contact the team.
8. Format responses using markdown: **bold** for emphasis, bullet points for lists.
9. Keep responses under 300 words unless the user specifically asks for detailed information.
10. If the user greets you, greet them back warmly and ask how you can help.

KNOWLEDGE BASE:
${HEALTHCHAIN_KNOWLEDGE}`;

