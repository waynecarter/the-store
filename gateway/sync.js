function sync(doc, oldDoc, meta) {
    requireAdmin();
    if (doc.type == 'product') {
        channel('products');
    } else if (doc.type == 'cart') {
        channel('user:' + doc.customerId);
    } else if (doc.type == 'order') {
        // Channel orders to the customer and store.
        channel('user:' + doc.customerId);
        channel('store:' + doc.storeId);
    } else if (doc.type == 'store') {
        channel('stores');
    }
}