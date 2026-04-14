const { Router } = require('express');
const chatbotController = require('../controllers/chatbot.controller');

const router = Router();

/**
 * @swagger
 * /api/chatbot/message:
 *   post:
 *     summary: Interactuar con el Chatbot de Inteligencia Artificial (Gemini)
 *     tags: [Chatbot]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [message]
 *             properties:
 *               message:
 *                 type: string
 *                 example: "¿Tienen teclados mecánicos o mouses gamer?"
 *               history:
 *                 type: array
 *                 description: Historial de mensajes previos de la conversación
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [user, assistant]
 *                     content:
 *                       type: string
 *     responses:
 *       200:
 *         description: Respuesta del chatbot y productos sugeridos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     reply:
 *                       type: string
 *                     suggestedProducts:
 *                       type: array
 *                       items:
 *                         type: integer
 *       400:
 *         description: El mensaje es requerido
 */
router.post('/message', chatbotController.handleIncomingMessage);

module.exports = router;
