const productService = require('../services/product.service');
const { uploadImage, deleteImage } = require('../services/cloudinary.service');
const ApiResponse = require('../utils/apiResponse');

class ProductController {
    async getAll(req, res, next) {
        try {
            const {
                page = 1,
                limit = 10,
                search,
                categoryId,
                minPrice,
                maxPrice,
                featured,
                brand,
                color,
            } = req.query;
            const { products, total } = await productService.getAll({
                page,
                limit,
                search,
                categoryId,
                minPrice,
                maxPrice,
                featured,
                brand,
                color,
            });
            return ApiResponse.paginated(res, products, total, page, limit, 'Productos obtenidos');
        } catch (error) {
            next(error);
        }
    }

    async getById(req, res, next) {
        try {
            const product = await productService.getById(req.params.id);
            return ApiResponse.success(res, { product });
        } catch (error) {
            next(error);
        }
    }

    async create(req, res, next) {
        try {
            const data = { ...req.body };
            const files = [
                ...((req.files && req.files.images) || []),
                ...((req.files && req.files.image) || []),
            ];

            if (files.length > 10) {
                return ApiResponse.error(res, 'Solo se permiten hasta 10 imágenes por producto', 400);
            }

            if (files.length > 0) {
                const imageUrls = await Promise.all(files.map((file) => uploadImage(file.buffer)));
                data.imageUrls = imageUrls;
                data.imageUrl = imageUrls[0];
            }

            if (typeof data.featured !== 'undefined') {
                data.featured = `${data.featured}` === 'true';
            }

            const product = await productService.create(data);
            return ApiResponse.created(res, { product }, 'Producto creado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const data = { ...req.body };
            const files = [
                ...((req.files && req.files.images) || []),
                ...((req.files && req.files.image) || []),
            ];

            if (files.length > 10) {
                return ApiResponse.error(res, 'Solo se permiten hasta 10 imágenes por producto', 400);
            }

            if (files.length > 0) {
                const existing = await productService.getById(req.params.id);
                if (existing.images && existing.images.length > 0) {
                    await Promise.all(existing.images.map((img) => deleteImage(img.imageUrl)));
                } else if (existing.imageUrl) {
                    await deleteImage(existing.imageUrl);
                }

                const imageUrls = await Promise.all(files.map((file) => uploadImage(file.buffer)));
                data.imageUrls = imageUrls;
                data.imageUrl = imageUrls[0];
            }

            if (typeof data.featured !== 'undefined') {
                data.featured = `${data.featured}` === 'true';
            }

            if (typeof data.active !== 'undefined') {
                data.active = `${data.active}` === 'true';
            }

            const product = await productService.update(req.params.id, data);
            return ApiResponse.success(res, { product }, 'Producto actualizado exitosamente');
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const result = await productService.delete(req.params.id);
            return ApiResponse.success(res, null, result.message);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ProductController();
