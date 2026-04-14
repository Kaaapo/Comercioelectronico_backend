const { GoogleGenerativeAI } = require("@google/generative-ai");

class GeminiProvider {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY || '';
        this.client = null;
        if (this.apiKey) {
            this.client = new GoogleGenerativeAI(this.apiKey);
        }
    }

    async generateResponse(systemPrompt, userMessage, history = []) {
        if (!this.client) {
            throw new Error('GEMINI_API_KEY no está configurada.');
        }

        const model = this.client.getGenerativeModel({
            model: "gemini-2.5-flash",
            systemInstruction: systemPrompt
        });

        // Formatear historial según los requisitos de Google AI
        const formattedHistory = history.map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        try {
            const chatSession = model.startChat({
                history: formattedHistory,
            });

            const result = await chatSession.sendMessage(userMessage);
            return result.response.text();
        } catch (error) {
            console.error('Error in Gemini Provider:', error);
            throw new Error('No se pudo comunicar con Gemini API.');
        }
    }
}

module.exports = new GeminiProvider();
