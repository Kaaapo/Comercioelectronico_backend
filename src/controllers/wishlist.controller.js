const wishlistService = require('../services/wishlist.service');
const ApiResponse = require('../utils/apiResponse');

class WishlistController {
    async getUserWishlist(req, res, next) {
        try {
            const wishlist = await wishlistService.getUserWishlist(req.user.id);
            return ApiResponse.success(res, wishlist, 'Favoritos obtenidos');
        } catch (error) {
            next(error);
        }
    }

    async addItem(req, res, next) {
        try {
            const productId = Number(req.body.productId);
            const { item, added } = await wishlistService.addItem(req.user.id, productId);

            if (added) {
                return ApiResponse.created(res, { item, added: true }, 'Producto agregado a favoritos');
            }

            return ApiResponse.success(res, { item, added: false }, 'El producto ya está en favoritos');
        } catch (error) {
            next(error);
        }
    }

    async removeItem(req, res, next) {
        try {
            const productId = Number(req.params.productId);
            await wishlistService.removeItem(req.user.id, productId);
            return ApiResponse.success(res, null, 'Producto eliminado de favoritos');
        } catch (error) {
            next(error);
        }
    }

    async isInWishlist(req, res, next) {
        try {
            const productId = Number(req.params.productId);
            const inWishlist = await wishlistService.isInWishlist(req.user.id, productId);
            return ApiResponse.success(res, { inWishlist });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new WishlistController();
