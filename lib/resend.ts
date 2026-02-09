import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY || 're_PPmeLmh1_JRjHhP5NjSFZibQcYtaxjucr';

export const resend = new Resend(resendApiKey);
