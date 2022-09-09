function product(context, args, lineItem, info) {
    return context.user.defaultCollection.get(lineItem.productId);
}