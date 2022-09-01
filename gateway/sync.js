function sync(doc, oldDoc, meta) {
    if (doc.type == 'product') {
        requireRole('admin');
        channel('products');
    } else if (doc.type == 'cart') {
        // TODO: Add security.
        var userChannel = 'user:admin';
        channel(userChannel);
    }
}