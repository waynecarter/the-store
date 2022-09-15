SELECT productId, sum(quantity) AS quantity
FROM   retail
LET for_store_id = len($args.storeId) > 0
WHERE  type = 'inventory'
       AND CASE
               WHEN for_store_id
               THEN storeId = $args.storeId
               ELSE TRUE
            END
GROUP BY productId, CASE WHEN for_store_id THEN storeId END
ORDER BY productId ASC