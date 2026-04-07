const { Wishlist, Product, Category, ProductImage } = require('../models');

class WishlistService {
    async getUserWishlist(userId) {
        const items = await Wishlist.findAll({
            where: { userId },
            include: [{
                model: Product,
                as: 'product',
                where: { active: true },
                include: [
                    { model: Category, as: 'category', attributes: ['id', 'name'] },
                    { model: ProductImage, as: 'images', attributes: ['id', 'imageUrl', 'sortOrder', 'isPrimary'] },
                ],
            }],
            order: [['createdAt', 'DESC']],
        });

        return { items, total: items.length };
    }

    async addItem(userId, productId) {
        const product = await Product.findOne({ where: { id: productId, active: true } });
        if (!product) {
            const error = new Error('Producto no encontrado');
            error.statusCode = 404;
            throw error;
        }

        const existing = await Wishlist.findOne({ where: { userId, productId } });
        if (existing) {
            return { item: existing, added: false };
        }

        const item = await Wishlist.create({ userId, productId });
        return { item, added: true };
    }

    async removeItem(userId, productId) {
        const item = await Wishlist.findOne({ where: { userId, productId } });
        if (!item) {
            const error = new Error('Producto no está en favoritos');
            error.statusCode = 404;
            throw error;
        }

        await item.destroy();
        return { removed: true };
    }

    async isInWishlist(userId, productId) {
        const item = await Wishlist.findOne({ where: { userId, productId } });
        return !!item;
    }
}

module.exports = new WishlistService();
