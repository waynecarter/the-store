function setOrderStatus(context, args, parent, info) {
    var orderId = args.orderId;
    var order = context.user.defaultCollection.get(orderId);
    if (!order || order.type != 'order') {
        throw('Invalid order.');
    }
    
    context.requireRole(["admin", order.storeId]);
    
    order.status = args.status;
    context.admin.defaultCollection.save(orderId, order);

    return true;
}