function sync(doc, oldDoc, meta) {
    if (doc.type == 'product') {
        requireRole('admin');
        channel('products');
    }
}