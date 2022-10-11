function product(lineItem, args, context, info) {
    return context.user.defaultCollection.get(lineItem.productId);
}