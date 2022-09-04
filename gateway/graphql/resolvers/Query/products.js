function products(context, args, parent, info) {
    return context.user.func('products', {
        search: args.search || '',
        limit: args.limit,
        offset: args.offset
    });
}