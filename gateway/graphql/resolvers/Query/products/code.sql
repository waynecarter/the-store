SELECT meta().id AS id, name, image, price, quantity
FROM   retail
WHERE  type = 'product'
       AND CASE
             WHEN len($args.search) > 0 THEN SEARCH(retail, $args.search)
             ELSE TRUE
           END
OFFSET CASE
         WHEN $args.`offset` > 0 THEN $args.`offset`
         ELSE 0
       END
LIMIT  CASE
         WHEN $args.`limit` > 0 THEN $args.`limit`
         ELSE 10
       END