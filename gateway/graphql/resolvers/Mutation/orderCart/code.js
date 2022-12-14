function orderCart(parent, args, context, info) {
    var storeId = args.storeId;
    var store = context.user.defaultCollection.get(storeId);
    if (!store || store.type != 'store') {
        throw('Invalid store.');
    }
    
    var cartId = 'cart:' + context.user.name;
    var cart = context.user.defaultCollection.get(cartId);
    if (!cart || !cart.items || Object.keys(cart.items).length == 0) {
        throw('Cart is empty.');
    }

    var order = {
        type: 'order',
        customerId: context.user.name,
        storeId: storeId,
        items: cart.items,
        status: 'PROCESSING'
    };
    var orderId = context.admin.defaultCollection.save(order);

    if (orderId) {
        delete cart.items;
        context.admin.defaultCollection.save(cart);

        order.id = orderId;
        return order;
    } else {
        throw('Failed to create order.')
    }
}