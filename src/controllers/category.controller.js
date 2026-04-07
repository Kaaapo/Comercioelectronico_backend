const { Category } = require('../models');
const { uploadImage, deleteImage } = require('../services/cloudinary.service');
const ApiResponse = require('../utils/apiResponse');

class CategoryController {
    async getAll(req, res, next) {
        try {
            const categories = await Category.findAll({
                order: [['name', 'ASC']],
            });
            return ApiResponse.success(res, { categories }, 'Categorías obtenidas');
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const category = await Category.findByPk(req.params.id);
            if (!category) {
                return ApiResponse.error(res, 'Categoría no encontrada', 404);
            }
            return ApiResponse.success(res, { category });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            if (!req.file) {
                return ApiResponse.error(res, 'La imagen de la categoría es requerida', 400);
            }

            const imageUrl = await uploadImage(req.file.buffer, null, 'categories');
            const payload = {
                ...req.body,
                imageUrl,
            };

            const category = await Category.create(payload);
            return ApiResponse.created(res, { category }, 'Categoría creada exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const category = await Category.findByPk(req.params.id);
            if (!category) {
                return ApiResponse.error(res, 'Categoría no encontrada', 404);
            }

            const payload = { ...req.body };
            if (req.file) {
                if (category.imageUrl) {
                    await deleteImage(category.imageUrl);
                }
                payload.imageUrl = await uploadImage(req.file.buffer, null, 'categories');
            }

            await category.update(payload);
            return ApiResponse.success(res, { category }, 'Categoría actualizada exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const category = await Category.findByPk(req.params.id);
            if (!category) {
                return ApiResponse.error(res, 'Categoría no encontrada', 404);
            }
            await category.destroy();
            return ApiResponse.success(res, null, 'Categoría eliminada exitosamente');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new CategoryController();
