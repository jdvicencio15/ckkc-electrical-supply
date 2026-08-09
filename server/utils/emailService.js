const nodemailer = require("nodemailer");
const logger = require("./logger");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, resetUrl) => {
  logger.info(`Sending password reset email to ${email}`);

  const info = await transporter.sendMail({
    from: `"Bigasan Pautang System" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Password Reset Request",

    text: `
You requested to reset your password.

Use the following link to reset your password:

${resetUrl}

This link will expire in 15 minutes.

If you did not request a password reset, you can safely ignore this email.
`,

    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2>Password Reset</h2>

        <p>You requested to reset your password.</p>

        <p>Click the button below to reset your password:</p>

        <a
          href="${resetUrl}"
          style="
            display:inline-block;
            padding:12px 20px;
            background:#2563eb;
            color:#ffffff;
            text-decoration:none;
            border-radius:6px;
          "
        >
          Reset Password
        </a>

        <p>This link will expire in 15 minutes.</p>

        <p>
          If you did not request a password reset,
          you can safely ignore this email.
        </p>
      </div>
    `,
  });

  logger.info(`Password reset email sent: ${info.messageId}`);

  return info;
};

module.exports = {
  sendPasswordResetEmail,
};