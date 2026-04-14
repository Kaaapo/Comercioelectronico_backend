class MockProvider {
    async generateResponse(systemPrompt, userMessage, history = []) {
        console.log("[MockProvider] Simulando llamada a IA... Configura GEMINI_API_KEY para activar Gemini.");
        const lowerMessage = userMessage.toLowerCase();

        if (lowerMessage.includes('devolu') || lowerMessage.includes('reembolso') || lowerMessage.includes('retorno')) {
            return JSON.stringify({
                reply: "Comprendo que tienes dudas sobre devoluciones. Según nuestras políticas tienes 30 días posteriores a la compra para realizarla, siempre que el producto esté en su empaque original. Ve a 'Mis Pedidos' y pulsa 'Solicitar Devolución'. ¿En qué más puedo ayudarte?",
                suggestedProductIds: []
            });
        }

        if (lowerMessage.includes('recomiend') || lowerMessage.includes('busco') || lowerMessage.includes('quiero')) {
            return JSON.stringify({
                reply: "Con gusto te ayudo a encontrar el producto ideal. Cuéntame un poco más: ¿buscas un mouse, teclado, audífonos, laptop u otro periférico gamer? Así te doy una recomendación más precisa.",
                suggestedProductIds: []
            });
        }

        if (lowerMessage.includes('hola') || lowerMessage.includes('buenas') || lowerMessage.includes('hey')) {
            return JSON.stringify({
                reply: "¡Hola! Soy el asistente virtual de Game Store Neiva 🎮. Puedo ayudarte con recomendaciones de productos, información sobre nuestro catálogo y guiarte en el proceso de devoluciones. ¿En qué puedo ayudarte hoy?",
                suggestedProductIds: []
            });
        }

        if (lowerMessage.includes('envio') || lowerMessage.includes('envío') || lowerMessage.includes('entrega')) {
            return JSON.stringify({
                reply: "Los envíos estándar tardan de 3 a 5 días hábiles. Si necesitas tu pedido antes, contamos con envío express de 1 a 2 días hábiles (disponibilidad según zona). Puedes rastrear tu pedido en tiempo real desde la sección 'Rastreo' en el menú principal.",
                suggestedProductIds: []
            });
        }

        return JSON.stringify({
            reply: "Esa es una buena pregunta. Para darte la mejor respuesta posible, necesito que el administrador active la integración con Gemini AI. Mientras tanto, puedo ayudarte con devoluciones, envíos o recomendaciones generales. ¿Qué necesitas?",
            suggestedProductIds: []
        });
    }
}

module.exports = new MockProvider();
