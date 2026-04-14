const chatbotService = require('../services/chatbot/chatbot.service');
const ApiResponse = require('../utils/apiResponse');

class ChatbotController {
    async handleIncomingMessage(req, res, next) {
        try {
            const { message, history } = req.body;

            if (!message || typeof message !== 'string' || message.trim() === '') {
                return ApiResponse.error(res, 'El mensaje del usuario es requerido', 400);
            }

            const response = await chatbotService.handleMessage(message.trim(), history || []);

            return ApiResponse.success(res, response, 'Mensaje procesado con éxito');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChatbotController();
