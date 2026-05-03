// Servicio de envío de correos transaccionales con SendGrid
const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM; // Remitente verificado en SendGrid

/**
 * Envía el correo de verificación de cuenta al usuario recién registrado.
 * @param {string} toEmail - Correo destino
 * @param {string} userName - Nombre del usuario
 * @param {string} token    - Token de verificación único
 */
const sendVerificationEmail = async (toEmail, userName, token) => {
    const verifyUrl = `${process.env.APP_URL}/api/auth/verify-email?token=${token}`;

    await sgMail.send({
        from: { email: FROM_EMAIL, name: 'E-Commerce 🛒' },
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

    await sgMail.send({
        from: { email: FROM_EMAIL, name: 'E-Commerce 🛒' },
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

/**
 * Envía email de confirmación de pedido con template gaming.
 * @param {string} toEmail    - Correo destino
 * @param {string} userName   - Nombre del usuario
 * @param {object} order      - Objeto de la orden (orderNumber, total, shippingAddress, status)
 * @param {Array}  items      - Array de items [{product: {name, imageUrl}, quantity, unitPrice}]
 */
const sendOrderConfirmationEmail = async (toEmail, userName, order, items = []) => {
    const firstName = userName.split(' ')[0];
    const orderNumber = order.orderNumber || order.id;
    const totalFormatted = new Intl.NumberFormat('es-CO', {
        style: 'currency', currency: 'COP', maximumFractionDigits: 0
    }).format(order.total);

    const itemsHtml = items.map(item => {
        const subtotal = new Intl.NumberFormat('es-CO', {
            style: 'currency', currency: 'COP', maximumFractionDigits: 0
        }).format(parseFloat(item.unitPrice) * item.quantity);

        return `
        <tr>
            <td style="padding: 10px 8px; border-bottom: 1px solid #1C1C2E; color: #e0e0e0; font-size: 13px;">
                ${item.product?.name || 'Producto'}
            </td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #1C1C2E; color: #aaa; font-size: 13px; text-align: center;">
                ${item.quantity}
            </td>
            <td style="padding: 10px 8px; border-bottom: 1px solid #1C1C2E; color: #00E5FF; font-size: 13px; text-align: right; font-weight: bold;">
                ${subtotal}
            </td>
        </tr>`;
    }).join('');

    await sgMail.send({
        from: { email: FROM_EMAIL, name: 'Game Store Neiva 🎮' },
        to: toEmail,
        subject: `✅ Pedido #${orderNumber} confirmado — Game Store Neiva`,
        html: `
        <!DOCTYPE html>
        <html lang="es">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
        <body style="margin:0; padding:0; background-color:#080810; font-family: Arial, sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#080810; padding: 32px 16px;">
                <tr><td align="center">
                    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background-color:#12121E; border-radius:16px; overflow:hidden; border: 1px solid #1C1C2E;">

                        <!-- Header con gradiente -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #00E5FF 0%, #7C3AED 100%); padding: 0; height: 4px;"></td>
                        </tr>
                        <tr>
                            <td style="background-color:#12121E; padding: 32px 40px 24px; text-align:center;">
                                <div style="font-size: 28px; font-weight: 900; color: #00E5FF; letter-spacing: 4px;">GAME STORE</div>
                                <div style="font-size: 13px; font-weight: 700; color: #7C3AED; letter-spacing: 6px; margin-top: 2px;">NEIVA</div>
                                <div style="margin-top: 20px; display: inline-block; background: rgba(0,229,255,0.1); border: 1px solid rgba(0,229,255,0.3); border-radius: 50px; padding: 8px 20px;">
                                    <span style="color: #00E5FF; font-size: 13px; font-weight: bold;">✅ PEDIDO CONFIRMADO</span>
                                </div>
                            </td>
                        </tr>

                        <!-- Saludo -->
                        <tr>
                            <td style="padding: 0 40px 20px;">
                                <p style="color: #e0e0e0; font-size: 16px; margin: 0;">
                                    ¡Hola, <strong style="color: #00E5FF;">${firstName}</strong>! 🎮
                                </p>
                                <p style="color: #aaa; font-size: 14px; margin: 10px 0 0; line-height: 1.6;">
                                    Tu pedido ha sido recibido exitosamente y está siendo procesado.
                                    Te notificaremos cuando sea enviado.
                                </p>
                            </td>
                        </tr>

                        <!-- Info del pedido -->
                        <tr>
                            <td style="padding: 0 40px 24px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#1C1C2E; border-radius:12px; overflow:hidden;">
                                    <tr>
                                        <td style="padding: 16px 20px; border-bottom: 1px solid #252540;">
                                            <span style="color:#aaa; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Número de pedido</span><br>
                                            <span style="color:#00E5FF; font-size:16px; font-weight:bold; margin-top:4px; display:block;">#${orderNumber}</span>
                                        </td>
                                        <td style="padding: 16px 20px; border-bottom: 1px solid #252540; text-align:right;">
                                            <span style="color:#aaa; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Estado</span><br>
                                            <span style="color:#FF6B2B; font-size:14px; font-weight:bold; margin-top:4px; display:block; text-transform:capitalize;">🕐 ${order.status}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="2" style="padding: 16px 20px;">
                                            <span style="color:#aaa; font-size:12px; text-transform:uppercase; letter-spacing:1px;">Dirección de envío</span><br>
                                            <span style="color:#e0e0e0; font-size:14px; margin-top:4px; display:block;">📍 ${order.shippingAddress || 'No especificada'}</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Tabla de productos -->
                        ${itemsHtml ? `
                        <tr>
                            <td style="padding: 0 40px 24px;">
                                <p style="color:#aaa; font-size:12px; text-transform:uppercase; letter-spacing:1px; margin:0 0 10px;">Productos del pedido</p>
                                <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:12px; overflow:hidden; background:#1C1C2E;">
                                    <thead>
                                        <tr style="background: rgba(0,229,255,0.08);">
                                            <th style="padding: 10px 8px; text-align:left; color:#00E5FF; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Producto</th>
                                            <th style="padding: 10px 8px; text-align:center; color:#00E5FF; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Cant.</th>
                                            <th style="padding: 10px 8px; text-align:right; color:#00E5FF; font-size:11px; text-transform:uppercase; letter-spacing:1px;">Subtotal</th>
                                        </tr>
                                    </thead>
                                    <tbody>${itemsHtml}</tbody>
                                </table>
                            </td>
                        </tr>` : ''}

                        <!-- Total -->
                        <tr>
                            <td style="padding: 0 40px 32px;">
                                <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(0,229,255,0.1) 0%, rgba(124,58,237,0.1) 100%); border: 1px solid rgba(0,229,255,0.2); border-radius:12px; overflow:hidden;">
                                    <tr>
                                        <td style="padding: 20px 24px;">
                                            <span style="color:#aaa; font-size:13px;">Total pagado</span>
                                        </td>
                                        <td style="padding: 20px 24px; text-align:right;">
                                            <span style="color:#FF6B2B; font-size:22px; font-weight:900;">${totalFormatted}</span>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background: linear-gradient(135deg, #00E5FF 0%, #7C3AED 100%); padding: 0; height: 2px;"></td>
                        </tr>
                        <tr>
                            <td style="padding: 24px 40px; text-align:center;">
                                <p style="color:#555; font-size:12px; margin:0; line-height:1.6;">
                                    Game Store Neiva — Neiva, Huila, Colombia<br>
                                    Si tienes alguna duda, contáctanos a través de la app.
                                </p>
                            </td>
                        </tr>

                    </table>
                </td></tr>
            </table>
        </body>
        </html>
        `,
    });
};

module.exports = { sendVerificationEmail, sendResetPasswordEmail, sendOrderConfirmationEmail };
