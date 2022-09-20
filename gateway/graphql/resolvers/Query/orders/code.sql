SELECT meta().id AS id, storeId, items, status
FROM   retail
LET for_store_id = len($args.storeId) > 0
WHERE  type = 'order'
       AND (status <> 'DELIVERED' AND status <> 'PICKED_UP')
       AND CASE
               WHEN for_store_id
               THEN storeId = $args.storeId
               ELSE TRUE
            END
ORDER BY id ASC