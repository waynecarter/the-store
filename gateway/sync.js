function sync(doc, oldDoc, meta) {
    requireAdmin();

    switch (doc.type) {
        case 'product':
            channel('products');
            break;
        case 'cart':
            channel('user:' + doc.customerId);
            break;
        case 'order':
            channel('orders');
            channel('user:' + doc.customerId);
            channel('store:' + doc.storeId);
            break;
        case 'store':
            channel('stores');
            break;
        default:
            throw("Invalid doc type.");
    }
}