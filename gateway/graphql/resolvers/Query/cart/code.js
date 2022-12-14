function cart(parent, args, context, info) {
    // TODO: Throw if context.user.name == null?
    var id = 'cart:' + context.user.name;
    var cart = context.user.defaultCollection.get(id) || {};
    
    cart.count = 0;
    for (var productId in cart.items) {
        var itemCount = cart.items[productId] || 0;
        cart.count += itemCount;
    }

    return cart;
}