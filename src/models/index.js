// Punto central de modelos: importa, define asociaciones y exporta todo
const sequelize = require('../config/database');
const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Cart = require('./Cart');
const CartItem = require('./CartItem');
const Order = require('./Order');
const OrderItem = require('./OrderItem');
const Payment = require('./Payment');
const Review = require('./Review');
const Return = require('./Return');
const Wishlist = require('./Wishlist');
const ProductImage = require('./ProductImage');

// ===================== ASOCIACIONES =====================

// User -> Cart (1:1)
User.hasOne(Cart, { foreignKey: 'userId', as: 'cart' });
Cart.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User -> Orders (1:N)
User.hasMany(Order, { foreignKey: 'userId', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Category -> Products (1:N)
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });

// Cart -> CartItems (1:N)
Cart.hasMany(CartItem, { foreignKey: 'cartId', as: 'items' });
CartItem.belongsTo(Cart, { foreignKey: 'cartId', as: 'cart' });

// CartItem -> Product
CartItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(CartItem, { foreignKey: 'productId', as: 'cartItems' });

// Order -> OrderItems (1:N)
Order.hasMany(OrderItem, { foreignKey: 'orderId', as: 'items' });
OrderItem.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// OrderItem -> Product
OrderItem.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
Product.hasMany(OrderItem, { foreignKey: 'productId', as: 'orderItems' });

// Order -> Payment (1:1)
Order.hasOne(Payment, { foreignKey: 'orderId', as: 'payment' });
Payment.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// User -> Reviews (1:N)
User.hasMany(Review, { foreignKey: 'userId', as: 'reviews' });
Review.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Product -> Reviews (1:N)
Product.hasMany(Review, { foreignKey: 'productId', as: 'reviews' });
Review.belongsTo(Product, { foreignKey: 'productId', as: 'product' });

// User -> Wishlist (1:N)
User.hasMany(Wishlist, { foreignKey: 'userId', as: 'wishlistItems', onDelete: 'CASCADE' });
Wishlist.belongsTo(User, { foreignKey: 'userId', as: 'user', onDelete: 'CASCADE' });

// Product -> Wishlist (1:N)
Product.hasMany(Wishlist, { foreignKey: 'productId', as: 'wishlistItems', onDelete: 'CASCADE' });
Wishlist.belongsTo(Product, { foreignKey: 'productId', as: 'product', onDelete: 'CASCADE' });

// Product -> ProductImage (1:N)
Product.hasMany(ProductImage, { foreignKey: 'productId', as: 'images', onDelete: 'CASCADE' });
ProductImage.belongsTo(Product, { foreignKey: 'productId', as: 'product', onDelete: 'CASCADE' });

// User -> Returns (1:N)
User.hasMany(Return, { foreignKey: 'userId', as: 'returns' });
Return.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Order -> Returns (1:N)
Order.hasMany(Return, { foreignKey: 'orderId', as: 'returns' });
Return.belongsTo(Order, { foreignKey: 'orderId', as: 'order' });

// OrderItem -> Returns (1:N)
OrderItem.hasMany(Return, { foreignKey: 'orderItemId', as: 'returns' });
Return.belongsTo(OrderItem, { foreignKey: 'orderItemId', as: 'orderItem' });

module.exports = {
    sequelize,
    User,
    Category,
    Product,
    Cart,
    CartItem,
    Order,
    OrderItem,
    Payment,
    Review,
    Return,
    Wishlist,
    ProductImage,
};
