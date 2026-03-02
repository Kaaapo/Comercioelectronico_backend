// Servicio de envío de correos transaccionales con Nodemailer (Gmail)
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Contraseña de aplicación de Google
    },
});

/**
 * Envía el correo de verificación de cuenta al usuario recién registrado.
 * @param {string} toEmail - Correo destino
 * @param {string} userName - Nombre del usuario
 * @param {string} token    - Token de verificación único
 */
const sendVerificationEmail = async (toEmail, userName, token) => {
    const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

    await transporter.sendMail({
        from: `"E-Commerce 🛒" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Verifica tu cuenta',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #333;">Hola, ${userName} 👋</h2>
                <p style="color: #555;">Gracias por registrarte. Para activar tu cuenta haz click en el botón:</p>
                <a href="${verifyUrl}"
                   style="display:inline-block; margin: 16px 0; padding: 12px 24px; background:#4F46E5; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">
                    Verificar mi cuenta
                </a>
                <p style="color: #999; font-size: 12px;">Este enlace expira en 24 horas. Si no creaste esta cuenta, ignora este correo.</p>
            </div>
        `,
    });
};

/**
 * Envía el correo de recuperación de contraseña.
 * @param {string} toEmail  - Correo destino
 * @param {string} userName - Nombre del usuario
 * @param {string} token    - Token de recuperación único
 */
const sendResetPasswordEmail = async (toEmail, userName, token) => {
    const resetUrl = `${process.env.APP_URL}/api/auth/reset-password?token=${token}`;

    await transporter.sendMail({
        from: `"E-Commerce 🛒" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: 'Recuperar contraseña',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #333;">Hola, ${userName} 👋</h2>
                <p style="color: #555;">Recibimos una solicitud para restablecer tu contraseña. Haz click en el botón:</p>
                <a href="${resetUrl}"
                   style="display:inline-block; margin: 16px 0; padding: 12px 24px; background:#DC2626; color:#fff; border-radius:6px; text-decoration:none; font-weight:bold;">
                    Restablecer contraseña
                </a>
                <p style="color: #999; font-size: 12px;">Este enlace expira en 1 hora. Si no solicitaste esto, ignora este correo.</p>
            </div>
        `,
    });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail };
