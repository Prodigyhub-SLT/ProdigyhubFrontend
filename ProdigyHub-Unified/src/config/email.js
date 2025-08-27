// src/config/email.js
const nodemailer = require('nodemailer');

// Email configuration
const emailConfig = {
  // Gmail configuration (you can change this to your email provider)
  gmail: {
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Use App Password, not regular password
    }
  },
  
  // Outlook/Hotmail configuration
  outlook: {
    service: 'outlook',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@outlook.com',
      pass: process.env.EMAIL_PASSWORD || 'your-password'
    }
  },
  
  // Custom SMTP configuration
  custom: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASSWORD || 'your-app-password'
    }
  }
};

// Get email configuration based on environment
const getEmailConfig = () => {
  const emailProvider = process.env.EMAIL_PROVIDER || 'gmail';
  return emailConfig[emailProvider] || emailConfig.gmail;
};

// Create transporter
const createTransporter = () => {
  const config = getEmailConfig();
  return nodemailer.createTransporter(config);
};

// Email templates
const emailTemplates = {
  verification: (userName, verificationLink) => ({
    subject: '🔐 Verify Your Email - SLT Prodigy Hub',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0;">SLT Prodigy Hub</h1>
            <p style="color: #7f8c8d; margin: 10px 0;">The Connection</p>
          </div>
          
          <h2 style="color: #2c3e50; text-align: center;">Email Verification Required</h2>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Hello <strong>${userName}</strong>,
          </p>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Thank you for creating an account with SLT Prodigy Hub! To complete your registration and activate your account, please verify your email address by clicking the button below:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" 
               style="background-color: #3498db; color: #ffffff; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
              ✅ Verify Email Address
            </a>
          </div>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            If the button above doesn't work, you can copy and paste this link into your browser:
          </p>
          
          <p style="background-color: #ecf0f1; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; color: #2c3e50;">
            ${verificationLink}
          </p>
          
          <p style="color: #7f8c8d; font-size: 14px; margin-top: 30px;">
            This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px;">
              © 2024 SLT Prodigy Hub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      SLT Prodigy Hub - Email Verification Required
      
      Hello ${userName},
      
      Thank you for creating an account with SLT Prodigy Hub! To complete your registration and activate your account, please verify your email address by clicking the link below:
      
      ${verificationLink}
      
      This verification link will expire in 24 hours. If you didn't create this account, please ignore this email.
      
      © 2024 SLT Prodigy Hub. All rights reserved.
    `
  }),
  
  welcome: (userName) => ({
    subject: '🎉 Welcome to SLT Prodigy Hub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0;">SLT Prodigy Hub</h1>
            <p style="color: #7f8c8d; margin: 10px 0;">The Connection</p>
          </div>
          
          <h2 style="color: #27ae60; text-align: center;">🎉 Welcome Aboard!</h2>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Hello <strong>${userName}</strong>,
          </p>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            Congratulations! Your email has been successfully verified and your account is now active. You can now access all features of SLT Prodigy Hub.
          </p>
          
          <div style="background-color: #d5f4e6; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #27ae60; margin-top: 0;">What's Next?</h3>
            <ul style="color: #34495e; line-height: 1.6;">
              <li>Complete your profile</li>
              <li>Explore our services</li>
              <li>Connect with our team</li>
              <li>Access your dashboard</li>
            </ul>
          </div>
          
          <p style="color: #34495e; font-size: 16px; line-height: 1.6;">
            If you have any questions or need assistance, feel free to contact our support team.
          </p>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1;">
            <p style="color: #7f8c8d; font-size: 12px;">
              © 2024 SLT Prodigy Hub. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    `,
    text: `
      SLT Prodigy Hub - Welcome!
      
      Hello ${userName},
      
      Congratulations! Your email has been successfully verified and your account is now active. You can now access all features of SLT Prodigy Hub.
      
      What's Next?
      - Complete your profile
      - Explore our services
      - Connect with our team
      - Access your dashboard
      
      If you have any questions or need assistance, feel free to contact our support team.
      
      © 2024 SLT Prodigy Hub. All rights reserved.
    `
  })
};

// Send email function
const sendEmail = async (to, template, data) => {
  try {
    const transporter = createTransporter();
    const emailContent = emailTemplates[template](data.userName, data.verificationLink);
    
    const mailOptions = {
      from: `"SLT Prodigy Hub" <${process.env.EMAIL_USER || 'noreply@prodigyhub.com'}>`,
      to: to,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  createTransporter,
  sendEmail,
  emailTemplates
};
