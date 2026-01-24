import { NextRequest, NextResponse } from "next/server";

// Email configuration - uses Resend or a simple SMTP approach
// For production, you can use: Resend, SendGrid, AWS SES, etc.

interface EmailPayload {
    to: string;
    hospitalName: string;
    action: "approved" | "rejected";
    reason?: string | null;
    licenseNumber?: string | null;
    registrationNumber?: string | null;
}

export async function POST(request: NextRequest) {
    try {
        const body: EmailPayload = await request.json();
        const { to, hospitalName, action, reason, licenseNumber, registrationNumber } = body;

        if (!to || !hospitalName || !action) {
            return NextResponse.json(
                { error: "Missing required fields: to, hospitalName, action" },
                { status: 400 }
            );
        }

        // Generate email content
        const emailContent = generateEmailContent({
            hospitalName,
            action,
            reason,
            licenseNumber,
            registrationNumber,
        });

        // Check if Resend API key is configured
        const resendApiKey = process.env.RESEND_API_KEY;

        if (resendApiKey) {
            // Use Resend for production
            const response = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${resendApiKey}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || "HealthChain <noreply@healthchain.io>",
                    to: [to],
                    subject: emailContent.subject,
                    html: emailContent.html,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Resend API error:", errorData);
                return NextResponse.json(
                    { error: "Failed to send email via Resend", details: errorData },
                    { status: 500 }
                );
            }

            const result = await response.json();
            return NextResponse.json({
                success: true,
                message: "Email sent successfully",
                emailId: result.id,
            });
        } else {
            // Log email for development (no API key configured)
            console.log("=== EMAIL NOTIFICATION ===");
            console.log("To:", to);
            console.log("Subject:", emailContent.subject);
            console.log("Content:", emailContent.text);
            console.log("========================");

            return NextResponse.json({
                success: true,
                message: "Email logged (no RESEND_API_KEY configured)",
                devMode: true,
            });
        }
    } catch (error: unknown) {
        console.error("Email send error:", error);
        return NextResponse.json(
            { error: "Failed to send email", details: (error as { message?: string }).message },
            { status: 500 }
        );
    }
}

function generateEmailContent(params: {
    hospitalName: string;
    action: "approved" | "rejected";
    reason?: string | null;
    licenseNumber?: string | null;
    registrationNumber?: string | null;
}) {
    const { hospitalName, action, reason, licenseNumber, registrationNumber } = params;
    const isApproved = action === "approved";

    const subject = isApproved
        ? `🎉 Congratulations! ${hospitalName} is Now Verified on HealthChain`
        : `⚠️ Verification Update for ${hospitalName} - Action Required`;

    const html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0A0A0A; color: #ffffff;">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="width: 100%; max-width: 600px; border-collapse: collapse;">
                    <!-- Header -->
                    <tr>
                        <td style="padding: 30px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); border-radius: 16px 16px 0 0; text-align: center;">
                            <div style="display: inline-block; width: 60px; height: 60px; background-color: rgba(255,255,255,0.2); border-radius: 12px; line-height: 60px; font-size: 30px;">
                                ${isApproved ? "✓" : "⚠️"}
                            </div>
                            <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 20px 0 0 0; text-transform: uppercase; letter-spacing: 1px;">
                                ${isApproved ? "Verification Approved" : "Verification Update"}
                            </h1>
                        </td>
                    </tr>

                    <!-- Main Content -->
                    <tr>
                        <td style="padding: 40px 30px; background-color: #111111; border-left: 1px solid #222; border-right: 1px solid #222;">
                            <p style="color: #ffffff; font-size: 18px; font-weight: 600; margin: 0 0 10px 0;">
                                Dear ${hospitalName} Team,
                            </p>
                            
                            ${isApproved ? `
                                <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                                    We are pleased to inform you that your hospital verification application has been <strong style="color: #10B981;">approved</strong> by our administrative team.
                                </p>
                                
                                <div style="background-color: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 20px; margin: 25px 0;">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                        <span style="color: #10B981; font-size: 20px;">✓</span>
                                        <span style="color: #10B981; font-weight: 700; font-size: 16px;">You Are Now Verified!</span>
                                    </div>
                                    <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                                        Your facility is now part of the HealthChain network. You can access the Clinical Dashboard to manage patient records and collaborate securely.
                                    </p>
                                </div>
                            ` : `
                                <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                                    We regret to inform you that your hospital verification application could not be approved at this time.
                                </p>
                                
                                <div style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; padding: 20px; margin: 25px 0;">
                                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                                        <span style="color: #EF4444; font-size: 20px;">✕</span>
                                        <span style="color: #EF4444; font-weight: 700; font-size: 16px;">Verification Not Approved</span>
                                    </div>
                                    ${reason ? `
                                        <p style="color: #f87171; font-size: 13px; margin: 0 0 10px 0;">
                                            <strong>Reason:</strong>
                                        </p>
                                        <p style="color: #ffffff; font-size: 14px; margin: 0; padding: 15px; background-color: rgba(0,0,0,0.3); border-radius: 8px; border-left: 3px solid #EF4444;">
                                            ${reason}
                                        </p>
                                    ` : `
                                        <p style="color: #9ca3af; font-size: 13px; margin: 0;">
                                            Please contact our support team for more information.
                                        </p>
                                    `}
                                </div>
                                
                                <p style="color: #9ca3af; font-size: 14px; line-height: 1.6; margin: 20px 0;">
                                    You may resubmit your application after addressing the issues mentioned above. Please ensure all documentation is valid and up-to-date.
                                </p>
                            `}

                            <!-- Application Details -->
                            <div style="background-color: #1a1a1a; border-radius: 12px; padding: 20px; margin: 25px 0;">
                                <p style="color: #6b7280; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 15px 0;">
                                    Application Details
                                </p>
                                <table style="width: 100%;">
                                    <tr>
                                        <td style="color: #6b7280; font-size: 13px; padding: 8px 0;">Hospital Name:</td>
                                        <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right; font-weight: 600;">${hospitalName}</td>
                                    </tr>
                                    ${licenseNumber ? `
                                    <tr>
                                        <td style="color: #6b7280; font-size: 13px; padding: 8px 0;">MDCN License:</td>
                                        <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right; font-family: monospace;">${licenseNumber}</td>
                                    </tr>
                                    ` : ""}
                                    ${registrationNumber ? `
                                    <tr>
                                        <td style="color: #6b7280; font-size: 13px; padding: 8px 0;">CAC Number:</td>
                                        <td style="color: #ffffff; font-size: 13px; padding: 8px 0; text-align: right; font-family: monospace;">${registrationNumber}</td>
                                    </tr>
                                    ` : ""}
                                    <tr>
                                        <td style="color: #6b7280; font-size: 13px; padding: 8px 0;">Status:</td>
                                        <td style="padding: 8px 0; text-align: right;">
                                            <span style="background-color: ${isApproved ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}; color: ${isApproved ? "#10B981" : "#EF4444"}; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">
                                                ${isApproved ? "Verified" : "Rejected"}
                                            </span>
                                        </td>
                                    </tr>
                                </table>
                            </div>

                            ${isApproved ? `
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://healthchain.io"}/clinical" 
                                   style="display: block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 700; text-align: center; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0;">
                                    Access Clinical Dashboard →
                                </a>
                            ` : `
                                <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://healthchain.io"}/clinical/verify" 
                                   style="display: block; background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 700; text-align: center; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin: 25px 0;">
                                    Resubmit Application →
                                </a>
                            `}
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 25px 30px; background-color: #0a0a0a; border-radius: 0 0 16px 16px; border: 1px solid #222; border-top: none; text-align: center;">
                            <p style="color: #4b5563; font-size: 12px; margin: 0 0 10px 0;">
                                This is an automated message from HealthChain.
                            </p>
                            <p style="color: #374151; font-size: 11px; margin: 0;">
                                © ${new Date().getFullYear()} HealthChain. Secure Healthcare on the Blockchain.
                            </p>
                            <p style="color: #374151; font-size: 10px; margin: 15px 0 0 0;">
                                Questions? Contact us at support@healthchain.io
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
    `;

    const text = isApproved
        ? `Congratulations! ${hospitalName} is Now Verified on HealthChain\n\nYour hospital verification has been approved. You can now access the Clinical Dashboard.\n\nLicense: ${licenseNumber || "N/A"}\nCAC: ${registrationNumber || "N/A"}`
        : `Verification Update for ${hospitalName}\n\nUnfortunately, your verification application was not approved.\n\nReason: ${reason || "Please contact support"}\n\nYou may resubmit your application after addressing the issues.`;

    return { subject, html, text };
}
