function order(parent, args, context, info) {
    var order = context.user.defaultCollection.get(args.id);
    if (order) { order.id = args.id };
    return order;
}