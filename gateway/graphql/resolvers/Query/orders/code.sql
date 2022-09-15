SELECT meta().id AS id, storeId, items, status
FROM   retail
WHERE  type = 'order'
       AND storeId = $args.storeId