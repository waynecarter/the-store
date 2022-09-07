function orderCart(context, args, parent, info) {
    var storeId = args.storeId;
    var store = context.user.defaultCollection.get(storeId);
    if (!store) {
        throw('Invalid store.');
    }
    
    var cartId = 'cart:' + context.user.name;
    var cart = context.user.defaultCollection.get(cartId);
    if (!cart || !cart.items || Object.keys(cart.items).length == 0) {
        throw('Cart is empty.');
    }

    // HACK: Need a way to generate unique IDs. Use date for now.
    var orderId = 'order:' + Date.now();
    var order = {
        type: 'order',
        customerId: context.user.name,
        storeId: storeId,
        items: cart.items,
        status: 'AWAITING_FULLFILLMENT'
    };
    context.admin.defaultCollection.save(orderId, order);

    delete cart.items;
    context.admin.defaultCollection.save(cartId, cart);

    order.id = orderId;
    return order;
}