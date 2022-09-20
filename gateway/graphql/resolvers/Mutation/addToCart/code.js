function addToCart(context, args, parent, info) {
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

    var count = cart.items[productId] || 0;
    cart.items[productId] = count + 1;
    
    context.admin.defaultCollection.save(cartId, cart);

    return true;
}