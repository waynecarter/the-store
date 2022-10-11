function product(inventory, args, context, info) {
    return context.user.defaultCollection.get(inventory.productId);
}