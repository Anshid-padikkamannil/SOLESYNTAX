const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendVerificationEmail = async (email, verificationLink) => {

  const info = await transporter.sendMail({
    from: `"SOLESYNTAX" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your SOLESYNTAX Account',
    html:`
      <h2>Welcome to SOLESYNTAX!</h2>
      <p>Please verify your email address by clicking the link below:</p>
      <a href="${verificationLink}">
        Verify Email
      </a>
      <p>This link will expire soon.</p>
    `
  });
};

const sendPasswordResetEmail = async (email, resetLink) => {


  const info = await transporter.sendMail({
    from: `"SOLESYNTAX" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Reset Your SOLESYNTAX Password',
    html: `
      <h2>Password Reset Request</h2>

      <p>We received a request to reset your SOLESYNTAX password.</p>

      <p>Click the link below to create a new password:</p>

      <a href="${resetLink}">
        Reset Password
      </a>

      <p>This link will expire in 15 minutes.</p>

      <p>If you didn't request this, you can ignore this email.</p>
    `
  });
}

module.exports = {
  transporter,
  sendVerificationEmail,
  sendPasswordResetEmail
};