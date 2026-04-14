// Servicio de notificaciones vía WhatsApp (Twilio WhatsApp API)
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken  = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER; // ej: +14155238886 (sandbox Twilio)

// El cliente solo se inicializa si están configuradas las credenciales
let client = null;
if (accountSid && authToken) {
    try {
        client = twilio(accountSid, authToken);
    } catch (e) {
        console.warn('[WhatsApp] Credenciales de Twilio inválidas, el servicio estará desactivado:', e.message);
    }
}

/**
 * Normaliza un número colombiano a formato E.164.
 * 3144199320 → +573144199320
 */
const normalizePhone = (phone) => {
    if (!phone) return null;
    const digits = phone.replace(/[\s\-().]/g, '');
    if (digits.startsWith('+')) return digits;
    if (digits.startsWith('57')) return `+${digits}`;
    return `+57${digits}`;
};

/**
 * Envía un mensaje de WhatsApp al número indicado.
 */
const sendWhatsApp = async (toPhone, message) => {
    if (!client) {
        console.warn('[WhatsApp] Twilio no está configurado. Configura TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN y TWILIO_PHONE_NUMBER en el .env');
        return;
    }
    if (!toPhone) {
        console.warn('[WhatsApp] No se envió mensaje: el usuario no tiene número de teléfono registrado.');
        return;
    }

    const normalizedPhone = normalizePhone(toPhone);
    const normalizedFrom  = normalizePhone(fromNumber);

    try {
        await client.messages.create({
            body: message,
            from: `whatsapp:${normalizedFrom}`,
            to:   `whatsapp:${normalizedPhone}`,
        });
        console.log(`[WhatsApp] Enviado a ${normalizedPhone}`);
    } catch (error) {
        console.error('[WhatsApp] Error al enviar mensaje:', error.message);
    }
};

/**
 * WhatsApp de confirmación de pedido.
 */
const sendOrderConfirmationSms = async (toPhone, userName, orderNumber, total) => {
    const firstName = userName.split(' ')[0];
    const totalFormatted = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(total);
    const message = `🎮 *Game Store Neiva*\n\n¡Hola ${firstName}! Tu pedido *#${orderNumber}* por *${totalFormatted}* fue recibido exitosamente. ✅\n\nTe notificaremos cuando sea enviado. ¡Gracias por tu compra! 🛒`;
    await sendWhatsApp(toPhone, message);
};

/**
 * WhatsApp de cambio de estado del pedido.
 */
const sendOrderStatusSms = async (toPhone, userName, orderNumber, newStatus) => {
    const firstName = userName.split(' ')[0];
    const statusMessages = {
        procesando: `🔧 Tu pedido *#${orderNumber}* está siendo procesado.`,
        enviado:    `🚚 Tu pedido *#${orderNumber}* ya fue enviado. ¡Pronto llegará!`,
        entregado:  `✅ Tu pedido *#${orderNumber}* fue entregado. ¡Disfrútalo!`,
        cancelado:  `❌ Tu pedido *#${orderNumber}* fue cancelado. Contáctanos si tienes dudas.`,
    };
    const statusText = statusMessages[newStatus] || `Tu pedido *#${orderNumber}* cambió a estado: ${newStatus}.`;
    const message = `🎮 *Game Store Neiva*\n\nHola ${firstName}! ${statusText}`;
    await sendWhatsApp(toPhone, message);
};

module.exports = { sendOrderConfirmationSms, sendOrderStatusSms };
