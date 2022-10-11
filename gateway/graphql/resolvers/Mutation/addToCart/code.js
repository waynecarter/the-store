function addToCart(parent, args, context, info) {
    var productId = args.productId;
    var product = context.user.defaultCollection.get(productId);
    if (!product || product.type != 'product') {
        return false;
    }

    var cartId = 'cart:' + context.user.name;
    var cart = context.user.defaultCollection.get(cartId) || {
        type: 'cart',
        items: {},
        customerId: context.user.name
    };
    if (!cart.items) { cart.items = {} };
    cart.items[productId] = (cart.items[productId] || 0) + 1;
    
    context.admin.defaultCollection.save(cart, cartId);

    return true;
}