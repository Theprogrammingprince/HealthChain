const { Resend } = require('resend');

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM;

if (!resendApiKey) {
    console.error('Error: RESEND_API_KEY is not defined in environment');
    process.exit(1);
}

if (!fromEmail) {
    console.error('Error: EMAIL_FROM is not defined in environment');
    process.exit(1);
}

const resend = new Resend(resendApiKey);

async function testEmail() {
    console.log(`Attempting to send test email from: ${fromEmail}`);
    try {
        const toEmail = fromEmail.match(/<(.+)>/)?.[1] || fromEmail;
        console.log(`Sending to: ${toEmail}`);

        const { data, error } = await resend.emails.send({
            from: fromEmail,
            to: [toEmail],
            subject: 'HealthChain Email Configuration Test',
            html: '<h1>Email Configuration Success!</h1><p>This is a test email from the HealthChain development environment.</p>'
        });

        if (error) {
            console.error('Resend Error:', JSON.stringify(error, null, 2));
            return;
        }

        console.log('Email sent successfully!', data);
    } catch (err) {
        console.error('Unexpected error:', err);
    }
}

testEmail();
