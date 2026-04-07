// Servicio para subir y eliminar imágenes de productos en Cloudinary
const cloudinary = require('cloudinary').v2;
const multer = require('multer');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Almacenamiento en memoria (no guarda en disco)
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB máximo
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Solo se permiten archivos de imagen'), false);
        }
    },
});

/**
 * Sube un buffer de imagen a Cloudinary y retorna la URL segura.
 * @param {Buffer} buffer - Buffer del archivo
 * @param {string} [publicId] - ID público existente (para reemplazar imagen anterior)
 * @param {string} [folder='products'] - Carpeta destino en Cloudinary
 * @returns {Promise<string>} URL de la imagen subida
 */
const uploadImage = (buffer, publicId = null, folder = 'products') => {
    return new Promise((resolve, reject) => {
        const options = {
            folder,
            resource_type: 'image',
            transformation: [
                { width: 800, height: 800, crop: 'limit' }, // Redimensiona sin distorsionar
                { quality: 'auto' },                         // Compresión automática
                { fetch_format: 'auto' },                    // Formato óptimo (webp, etc.)
            ],
        };

        if (publicId) options.public_id = publicId;

        const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
            if (error) reject(error);
            else resolve(result.secure_url);
        });

        stream.end(buffer);
    });
};

/**
 * Elimina una imagen de Cloudinary dado su public_id.
 * @param {string} imageUrl - URL de la imagen en Cloudinary
 */
const deleteImage = async (imageUrl) => {
    if (!imageUrl || !imageUrl.includes('cloudinary.com')) return;

    // Extraer public_id de la URL (products/nombre-archivo)
    const matches = imageUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    if (!matches) return;

    const publicId = matches[1];
    await cloudinary.uploader.destroy(publicId);
};

module.exports = { upload, uploadImage, deleteImage };
