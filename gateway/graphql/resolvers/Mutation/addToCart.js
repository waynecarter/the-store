function addToCart(parent, args, context, info) {
    var productId = args.productId;
    var product = context.app.get(productId);
    if (!product) { return false; }

    var cartId = 'cart:' + context.user.name;
    var cart = context.app.get(cartId) || { items: {} };
    if (!cart.items) { cart.items = {} };

    // HACK: cart.items[productId] returns a string for it's numberic value,
    // so construct a Number from the value.
    var count = Number(cart.items[productId]) || 0;
    cart.items[productId] = count + 1;
    
    context.app.save(cartId, {
        type: 'cart',
        items: cart.items
    });

    return true;
}