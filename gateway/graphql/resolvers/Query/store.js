function store(context, args, parent, info) {
    return context.user.defaultCollection.get(args.id);
}