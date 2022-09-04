function items(context, args, order, info) {
    var items = [];
    for (var productId in order.items) {
        items.push({
            productId: productId,
            count: Number(order.items[productId]) || 0
        });
    }

    return items;
}