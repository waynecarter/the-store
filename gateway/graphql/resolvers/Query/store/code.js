function store(parent, args, context, info) {
    return context.user.defaultCollection.get(args.id);
}