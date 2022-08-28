function products(parent, args, context, info) {
    return context.app.query('getProducts', {
        search: args.search != null ? args.search : "",
        limit: args.limit,
        offset: args.offset
    });
}