function setOrderStatus(parent, args, context, info) {
    var orderId = args.orderId;
    var order = context.user.defaultCollection.get(orderId);
    if (!order || order.type != 'order') {
        throw('Invalid order.');
    }
    
    context.requireRole(["admin", order.storeId]);
    
    order.status = args.status;
    context.admin.defaultCollection.save(order);

    return true;
}