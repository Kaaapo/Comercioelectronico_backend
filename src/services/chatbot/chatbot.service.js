const { Op } = require('sequelize');
const Product = require('../../models/Product');
const geminiProvider = require('./providers/gemini.provider');
const mockProvider = require('./providers/mock.provider');

class ChatbotService {
    constructor() {
        // Usa Gemini si hay API Key, sino cae en el mock de respaldo
        this.provider = process.env.GEMINI_API_KEY ? geminiProvider : mockProvider;
    }

    async handleMessage(userMessage, history = []) {
        // 1. Traer productos activos con stock del inventario de Game Store Neiva
        const contextProducts = await Product.findAll({
            where: {
                active: true,
                stock: { [Op.gt]: 0 }
            },
            limit: 60,
            attributes: ['id', 'name', 'price', 'description', 'brand', 'stock', 'color']
        });

        // 2. Construir el System Prompt con reglas del negocio e inventario actual
        const systemPrompt = `
Eres un asistente virtual de soporte avanzado para "Game Store Neiva", una tienda especializada en productos gamer y de computación ubicada en Neiva, Colombia.

Tus responsabilidades principales son:
1. Dar recomendaciones de productos basadas en el inventario disponible.
2. Responder preguntas sobre el catálogo.
3. Brindar guías sobre devoluciones y preguntas frecuentes.

BASE DE CONOCIMIENTO Y POLÍTICAS DE LA TIENDA:

[1. DEVOLUCIONES Y REEMBOLSOS]
- Solo se aceptan devoluciones dentro de los 30 días posteriores a la fecha de compra.
- El producto debe contar con su empaque original.
- Causas válidas: Defecto de fabricación, daño en envío, o producto incorrecto.
- Instrucciones: El usuario debe ir a la sección "Mis Pedidos" en su cuenta y hacer clic en "Solicitar Devolución", anexando detalles y fotos.

[2. ENVÍOS Y PROCESO DE ENTREGA]
- Los envíos estándar toman de 3 a 5 días hábiles.
- Envíos express (si están disponibles) toman de 1 a 2 días hábiles.
- Una vez generada la compra, el usuario puede rastrear en tiempo real su paquete desde la sección "Rastreo" en la app.

[3. PROMOCIONES Y DESCUENTOS]
- No aplicamos descuentos retroactivos.
- Para fechas especiales (Cyber Lunes, Black Friday), publicaremos los cupones directamente en el banner principal de la app.

[4. MÉTODOS DE PAGO]
- Aceptamos: Tarjeta débito/crédito (Visa, Mastercard, AMEX), PayPal, PSE y Pago contraentrega.

INVENTARIO ACTUAL DISPONIBLE (SOLO recomienda productos de esta lista):
${contextProducts.length > 0
    ? JSON.stringify(contextProducts, null, 2)
    : 'No hay productos disponibles en este momento en el inventario.'}

REGLAS DE INTERACCIÓN:
- Sé amable, conciso y directo. Usa un tono cercano y entusiasta con los gamers.
- NO inventes productos que no estén en la lista del inventario.
- Si no hay productos relevantes, díselo amablemente.
- Responde siempre en español.

FORMATO DE RESPUESTA ESTRICTO:
Absolutamente SIEMPRE debes responder en JSON crudo (sin markdown, sin \`\`\`json). Estructura exacta:
{
  "reply": "Tu mensaje de respuesta natural y amigable para el usuario",
  "suggestedProductIds": [ID_1, ID_2]
}
Si no mencionaste productos específicos, el array va vacío [].
        `;

        // 3. Generar respuesta con el proveedor configurado
        const botRawReply = await this.provider.generateResponse(systemPrompt, userMessage, history);

        let parsedBotReply;
        try {
            const cleanJson = botRawReply.replace(/```json/g, '').replace(/```/g, '').trim();
            parsedBotReply = JSON.parse(cleanJson);
        } catch (error) {
            console.error("Error parseando JSON de Gemini:", botRawReply);
            parsedBotReply = {
                reply: "Hubo un pequeño error procesando tu consulta, por favor intenta de nuevo.",
                suggestedProductIds: []
            };
        }

        return {
            reply: parsedBotReply.reply,
            suggestedProducts: parsedBotReply.suggestedProductIds || []
        };
    }
}

module.exports = new ChatbotService();
