function sync(doc, oldDoc, meta) {
    if (doc.type == 'product') {
        requireRole('admin');
        channel('products');
    } else if (doc.type == 'cart') {
        // TODO: Add security.
        var userChannel = 'user:admin';
        channel(userChannel);
    } else if (doc.type == 'order') {
        channel('orders');
        channel('user:' + doc.customerId);
        channel('store:' + doc.storeId);
    } else if (doc.type == 'store') {
        channel('stores');
    }
}