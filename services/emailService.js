const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.verify((error, success) => {
  if (error) {
    console.error('Email connection failed:', error);
  } else {
    console.log('Email server is ready');
  }
})

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

module.exports = {
  transporter,
  sendVerificationEmail
};