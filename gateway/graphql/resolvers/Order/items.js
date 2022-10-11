function items(order, args, context, info) {
    var items = [];
    for (var productId in order.items) {
        items.push({
            productId: productId,
            count: order.items[productId] || 0
        });
    }

    return items;
}