import { resend } from './resend';

const FROM_EMAIL = 'notifications@healthchain.io'; // Note: Should be verified domain in Resend
const ADMIN_EMAIL = 'admin@healthchain.io';

export async function sendVerificationEmail(email: string, token: string) {
    const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [email],
        subject: 'Verify your HealthChain account',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #2563eb;">Welcome to HealthChain!</h1>
        <p>Please click the button below to verify your email address:</p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${token}" 
           style="display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          Verify Email
        </a>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
    });

    if (error) {
        console.error('Error sending verification email:', error);
        throw error;
    }

    return data;
}

export async function sendContactNotification(messageData: {
    first_name: string;
    last_name: string;
    email: string;
    message: string;
}) {
    const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [ADMIN_EMAIL],
        subject: `New Contact Message from ${messageData.first_name} ${messageData.last_name}`,
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Inquiry Received</h2>
        <p><strong>From:</strong> ${messageData.first_name} ${messageData.last_name} (${messageData.email})</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0;">
          ${messageData.message}
        </div>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/admin/messages" style="color: #2563eb;">View in Dashboard</a></p>
      </div>
    `,
    });

    if (error) {
        console.error('Error sending notification email:', error);
        throw error;
    }

    return data;
}

export async function sendReplyEmail(to: string, originalMessage: string, replyContent: string) {
    const { data, error } = await resend.emails.send({
        from: FROM_EMAIL,
        to: [to],
        subject: 'Re: Your inquiry to HealthChain',
        html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <p>Hello,</p>
        <p>${replyContent}</p>
        <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 30px 0;" />
        <p style="color: #6b7280; font-size: 14px;"><strong>Your original message:</strong></p>
        <blockquote style="color: #6b7280; border-left: 4px solid #e5e7eb; padding-left: 15px; margin: 10px 0;">
          ${originalMessage}
        </blockquote>
      </div>
    `,
    });

    if (error) {
        console.error('Error sending reply email:', error);
        throw error;
    }

    return data;
}
