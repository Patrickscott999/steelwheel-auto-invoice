import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

type EmailRequestBody = {
  to: string[];
  subject: string;
  text: string;
  html?: string;
  attachmentContent?: string;
  attachmentFilename?: string;
  attachmentContentType?: string;
  isBase64?: boolean;
};

export async function POST(req: NextRequest) {
  try {
    const { to, subject, text, html, attachmentContent, attachmentFilename, attachmentContentType, isBase64 } = await req.json() as EmailRequestBody;
    
    if (!to || !subject || !text) {
      return NextResponse.json(
        { error: 'Missing required email fields' },
        { status: 400 }
      );
    }

    // Configure email transport (using a service like Gmail, or an SMTP server)
    // For demonstration, we're using a test account with Ethereal Email
    const testAccount = await nodemailer.createTestAccount();
    
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    // Setup email options
    const mailOptions = {
      from: '"SteelWheel Auto" <invoices@steelwheelauto.com>',
      to: to.join(', '),
      subject,
      text,
      html: html || text,
      attachments: attachmentContent ? [
        {
          filename: attachmentFilename || 'invoice.pdf',
          content: isBase64 ? Buffer.from(attachmentContent, 'base64') : attachmentContent,
          contentType: attachmentContentType || 'text/plain',
        },
      ] : undefined,
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
    return NextResponse.json({
      success: true,
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info),
    });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}
