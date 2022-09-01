function cart(parent, args, context, info) {
    var cartId = 'cart:' + context.user.name;
    var cart = context.app.get(cartId) || { items: {} };
    if (!cart.items) { cart.items = {} };

    var items = [];
    var cartCount = 0;
    for (var productId in cart.items) {
        var product = context.app.get(productId);
        // HACK: cart.items[productId] returns a string for it's numberic value,
        // so construct a Number from the value.
        var itemCount = Number(cart.items[productId]) || 0;
        if (!product || itemCount < 1) { continue; }
        
        items.push({
            product: {
                id: productId,
                name: product.name,
                image: product.image,
                price: product.price
            },
            count: itemCount
        });

        cartCount += itemCount;
    }

    return {
        items: items,
        count: cartCount
    };
}