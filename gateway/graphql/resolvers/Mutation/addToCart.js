function addToCart(context, args, parent, info) {
    var productId = args.productId;
    var product = context.user.defaultCollection.get(productId);
    if (!product) { return false; }

    var cartId = 'cart:' + context.user.name;
    var cart = context.user.defaultCollection.get(cartId) || { items: {} };
    if (!cart.items) { cart.items = {} };

    var count = cart.items[productId] || 0;
    cart.items[productId] = count + 1;
    
    context.user.defaultCollection.save(cartId, cart);

    return true;
}