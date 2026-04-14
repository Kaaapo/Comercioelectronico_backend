const { Product, Category, ProductImage, sequelize } = require('../models');
const { Op } = require('sequelize');

class ProductService {
    removeUndefinedValues(payload) {
        return Object.fromEntries(Object.entries(payload).filter(([, value]) => typeof value !== 'undefined'));
    }

    async getAll({ page = 1, limit = 10, search, categoryId, minPrice, maxPrice, featured, brand, color, onDiscount, sort }) {
        const offset = (page - 1) * limit;
        const where = { active: true };

        if (search) {
            where.name = { [Op.iLike]: `%${search}%` };
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (minPrice || maxPrice) {
            where.price = {};
            if (minPrice) where.price[Op.gte] = minPrice;
            if (maxPrice) where.price[Op.lte] = maxPrice;
        }

        if (typeof featured !== 'undefined') {
            where.featured = `${featured}` === 'true';
        }

        if (brand) {
            where.brand = { [Op.iLike]: `%${brand}%` };
        }

        if (color) {
            where.color = { [Op.iLike]: `%${color}%` };
        }

        if (`${onDiscount}` === 'true') {
            where.discountPercentage = { [Op.gt]: 0 };
        }

        const { count, rows } = await Product.findAndCountAll({
            where,
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'sortOrder', 'isPrimary'],
                    separate: true,
                    order: [['sortOrder', 'ASC']],
                },
            ],
            distinct: true,
            limit: parseInt(limit),
            offset,
            order: sort === 'price_desc' ? [['price', 'DESC']]
                 : sort === 'price_asc'  ? [['price', 'ASC']]
                 : [['createdAt', 'DESC']],
        });

        return { products: rows, total: count };
    }

    async getById(id) {
        const product = await Product.findOne({
            where: { id, active: true },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'sortOrder', 'isPrimary'],
                    separate: true,
                    order: [['sortOrder', 'ASC']],
                },
            ],
        });

        if (!product) {
            const error = new Error('Producto no encontrado');
            error.statusCode = 404;
            throw error;
        }

        return product;
    }

    async create(data) {
        // Verificar que la categoría existe
        const category = await Category.findByPk(data.categoryId);
        if (!category) {
            const error = new Error('Categoría no encontrada');
            error.statusCode = 404;
            throw error;
        }

        const created = await sequelize.transaction(async (transaction) => {
            const productPayload = {
                name: data.name,
                description: data.description,
                brand: data.brand,
                color: data.color,
                price: data.price,
                stock: data.stock,
                categoryId: data.categoryId,
                featured: data.featured,
                imageUrl: data.imageUrl,
                originalPrice: data.originalPrice,
                discountPercentage: data.discountPercentage,
                supplier: data.supplier,
                specifications: data.specifications,
            };

            const product = await Product.create(this.removeUndefinedValues(productPayload), { transaction });

            if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
                const imageRows = data.imageUrls.map((url, index) => ({
                    productId: product.id,
                    imageUrl: url,
                    sortOrder: index,
                    isPrimary: index === 0,
                }));
                await ProductImage.bulkCreate(imageRows, { transaction });
                if (!product.imageUrl) {
                    await product.update({ imageUrl: data.imageUrls[0] }, { transaction });
                }
            }

            return product;
        });

        return created.reload({
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'sortOrder', 'isPrimary'],
                    separate: true,
                    order: [['sortOrder', 'ASC']],
                },
            ],
        });
    }

    async update(id, data) {
        const product = await Product.findByPk(id);
        if (!product) {
            const error = new Error('Producto no encontrado');
            error.statusCode = 404;
            throw error;
        }

        if (data.categoryId) {
            const category = await Category.findByPk(data.categoryId);
            if (!category) {
                const error = new Error('Categoría no encontrada');
                error.statusCode = 404;
                throw error;
            }
        }

        await sequelize.transaction(async (transaction) => {
            const payload = {
                name: data.name,
                description: data.description,
                brand: data.brand,
                color: data.color,
                price: data.price,
                stock: data.stock,
                categoryId: data.categoryId,
                active: data.active,
                originalPrice: data.originalPrice,
                discountPercentage: data.discountPercentage,
                supplier: data.supplier,
                specifications: data.specifications,
            };

            if (typeof data.featured !== 'undefined') {
                payload.featured = data.featured;
            }

            if (data.imageUrl) {
                payload.imageUrl = data.imageUrl;
            }

            await product.update(this.removeUndefinedValues(payload), { transaction });

            if (Array.isArray(data.imageUrls) && data.imageUrls.length > 0) {
                await ProductImage.destroy({ where: { productId: product.id }, transaction });
                const imageRows = data.imageUrls.map((url, index) => ({
                    productId: product.id,
                    imageUrl: url,
                    sortOrder: index,
                    isPrimary: index === 0,
                }));
                await ProductImage.bulkCreate(imageRows, { transaction });
                await product.update({ imageUrl: data.imageUrls[0] }, { transaction });
            }
        });

        return product.reload({
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'sortOrder', 'isPrimary'],
                    separate: true,
                    order: [['sortOrder', 'ASC']],
                },
            ],
        });
    }

    async getSimilar(id, limit = 6) {
        const product = await Product.findOne({ where: { id, active: true } });
        if (!product) return [];

        const rows = await Product.findAll({
            where: {
                categoryId: product.categoryId,
                active: true,
                id: { [Op.ne]: id },
            },
            include: [
                { model: Category, as: 'category', attributes: ['id', 'name'] },
                {
                    model: ProductImage,
                    as: 'images',
                    attributes: ['id', 'imageUrl', 'sortOrder', 'isPrimary'],
                    separate: true,
                    order: [['sortOrder', 'ASC']],
                },
            ],
            limit,
            order: [['createdAt', 'DESC']],
        });

        return rows;
    }

    async delete(id) {
        const product = await Product.findByPk(id);
        if (!product) {
            const error = new Error('Producto no encontrado');
            error.statusCode = 404;
            throw error;
        }

        // Soft delete
        await product.update({ active: false });
        return { message: 'Producto eliminado exitosamente' };
    }
}

module.exports = new ProductService();
