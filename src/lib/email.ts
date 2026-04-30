import nodemailer from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    console.warn('SMTP configuration is missing.');
    return null;
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587'),
    secure: SMTP_PORT === '465',
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS, 
    },
  });

  return transporter;
}

export const sendEmailAsync = (options: EmailOptions): void => {
  sendEmail(options)
    .then((info) => {
      console.log('Email sent:', info.messageId);
    })
    .catch((error) => {
      console.error('Email failed:', error);
    });
};

async function sendEmail(options: EmailOptions) {
  if (!options.text && !options.html) {
    throw new Error('Email must have text or HTML content');
  }

  const transporter = getTransporter();
  if (!transporter) {
    return { messageId: 'skipped-no-config' };
  }

  const { SMTP_FROM, SMTP_USER } = process.env;
  return await transporter.sendMail({
    from: SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
}