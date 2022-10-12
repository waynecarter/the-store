# Gateway GraphQL - Preview

This project is for previewing Gateway's GraphQL API.

## Resources

* [Setup Video](https://drive.google.com/file/d/1Lwvt80KGgGwQEpTVKXBYZouxVPXnqwSh/view?usp=sharing)
* [API Docs](https://docs.google.com/document/d/1sskhijMOlviqhY_AJE7_e7W1ue1J32BCfKLt_PKnzhU/edit#)

## Prerequisites

### Node.js
[Node.js](https://nodejs.org/en/download/) is required for the instructions below. Open a terminal and check whether you have Node installed:
```console
$ node -v
```

## Setup

### Server 
1. Install [Couchbase Server EE](https://www.couchbase.com/downloads).
2. Open the Server's `Admin Console`.
3. Add a new bucket named `retail`.
4. Grant your admin user the `Sync Gateway` role for the `retail` bucket.
5. Create a full-text index for the `product` documents:
   1. Navigate to the `Search` screen.
   2. Click `Add Index`.
   3. Name the index 'airports'.
   4. Choose the `retail` bucket.
   4. In the `Type Mapping` section,
      1. Disable the '# default' mapping.
      2. Add a mapping with the name 'product'.

### Gateway
1. In `bin/gateway.json`, update `bootstrap.username` and `bootstrap.password` with your admin user's credentials.
2. Open a terminal, and navigate to the `bin` directory:
```console
$ cd bin
```
3. Depending on your machine's CPU architecture, navigate to `mac-arm` or `mac-intel` directory:
```console
$ cd mac-arm

OR

$ cd mac-intel
```
4. Remove the `com.apple.quarantine` xattr from the unsigned Gateway binary:
```console
$ xattr -cr sync_gateway
```
5. Start the Gateway:
```console
$  ./gateway.sh
```

### Node.js
[Node.js](https://nodejs.org/en/download/) is required for the instructions below. Open a terminal and check whether you have Node installed:
```console
$ node -v
```

## Deploy
The project includes a `deploy` directory that contains `deploy.js` and `deploy.json`. 

```
deploy
├─ deploy.js
└─ deploy.json
```

### deploy.js

`deploy.js` reads the project files and deploys the config to the Gateway's admin REST API.

To run from the console,

1. Open a terminal, and navigate to the `deploy` directory:
```console
$ cd deploy
```
2. Deploy the example config to the Gateway:
```console
$ node deploy.js
```

To run from VS.Code,

1. Navigate to the 'Run and Debug' view.
2. From the configurations dropdown on the 'Run and Debug' view, choose the 'Deploy to Gateway'.
3. From the app menu, choose 'Run > Start Debugging' 

### deploy.json

The `deploy.json` file contains the example config for when `deploy.js` is run.

```json
{
    "gateway": {
        "host": "localhost",
        "database": {
            "name": "retail",
            "bucket": "retail"
        }
    },
    "include": {
        "database": true,
        "users": true,
        "roles": true,
        "sync": true,
        "resync": true,
        "functions": true,
        "graghql": true
    }
}
```

The `gateway` object defines the gateway host and database that the deployment will targat.

The `include` object defines the configuration that will be included in the deployment.

## HTTP Examples

The `example.http` file that contains example HTTP requests for calling configured `graghql` and `function` endpoints.

**Recomendation:** Install the VS.Code [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) extension. It allows you to send HTTP request and view the response in VS.Code directly.

## App

The `docs` directory contains the example retail JAMStack application written using HTML, JavaScript, and GraphQL APIs.

This app can be run [directly from the github repo](https://waynecarter.github.io/the-store/), using the local files, or deploying to a web-server.

When you run the app it connects to the Gateway instance on localhost. For running directly from the github repo, CORS is configured in `bin/gateway.json` and contains origin entires for `https://waynecarter.github.io` 

## Gateway

The `gateway` directory contains the example config for the `graphql`, `functions`, `users`, `roles`, and `sync` Gateway APIs.

### GraphQL

The `graphql` directory contains the example `schema.graphql` and `resolvers` for the Gateway GraphQL API.

```
graphql
├─ schema.graphql
└─ resolvers
```

#### schema.graphql

The `schema.graphql` file contains the example [GraphQL schema](https://graphql.org/learn/schema/) config.

```js
type Product {
    id: ID!
    name: String!
    image: String!
    price: Float!
}

type Query {
    products(search: String, offset: Int, limit: Int): [Product!]
}
```

#### resolvers

The `resolvers` directory contains the example resolvers for the `schema.graphql`. Resolvers can be written in JavaScript or SQL are organized into *type* sub-directories containing additional *field* resolver sub-directories for each *field* on the *type*. *Rield* resolver sub-directories contain a `config.json` file and either a `code.js` or `code.sql`.

```
resolvers
└─ Query
   └─ products
      ├─ code.sql
      └─ config.json
└─ Mutation
   └─ addToCart
      ├─ code.js
      └─ config.json
```

##### Query/products
The `Query/products` directory contains the example config for the `products` Query.

###### code.sql

The `code.sql` file contains the example SQL++ implementation.

```sql
SELECT meta().id AS id, name, image, price, quantity
FROM   retail
WHERE  type = 'product'
       AND CASE
             WHEN len($args.search) > 0 THEN SEARCH(retail, $args.search)
             ELSE TRUE
           END
ORDER BY name ASC
OFFSET CASE
         WHEN $args.`offset` > 0 THEN $args.`offset`
         ELSE 0
       END
LIMIT  CASE
         WHEN $args.`limit` > 0 THEN $args.`limit`
         ELSE 10
       END
```

###### config.json

The `config.json` file contains the example config.

```json
{
    "allow": {
        "channels": ["products"]
    }
}
```

##### Mutation/addToCart
The `Mutation/addToCart` directory contains the example config for the `addToCart` Mutation.

###### code.js

The `code.js` file contains the example JavaScript implementation.

```js
function addToCart(parent, args, context, info) {
    var productId = args.productId;
    var product = context.user.defaultCollection.get(productId);
    if (!product || product.type != 'product') {
        return false;
    }

    var cartId = 'cart:' + context.user.name;
    var cart = context.user.defaultCollection.get(cartId) || {
        type: 'cart',
        items: {},
        customerId: context.user.name
    };
    if (!cart.items) { cart.items = {} };
    cart.items[productId] = (cart.items[productId] || 0) + 1;
    
    context.admin.defaultCollection.save(cart, cartId);

    return true;
}
```

###### config.json

The `config.json` file contains the example config.

```json
{
    "allow": {
        "roles": ["customer", "admin"]
    }
}
```

### Functions

The `functions` directory contains the example server side functions. Functions can be written in JavaScript or SQL and are organized into *function* sub-directories containing a `config.json` file and either a `code.js` or `code.sql`.

```
functions
└─ products
   ├─ code.sql
   └─ config.json
```

#### products

The `products` directory contains the example config for the `products` function.

##### code.sql

```sql
SELECT meta().id AS id, name, image, price, quantity
FROM   retail
WHERE  type = 'product'
       AND CASE
             WHEN len($args.search) > 0 THEN SEARCH(retail, $args.search)
             ELSE TRUE
           END
ORDER BY name ASC
OFFSET CASE
         WHEN $args.`offset` > 0 THEN $args.`offset`
         ELSE 0
       END
LIMIT  CASE
         WHEN $args.`limit` > 0 THEN $args.`limit`
         ELSE 10
       END
```

###### config.json

The `config.json` file contains the example config.

```json
{
    "args": ["search", "offset", "limit"],
    "allow": {
        "channels": ["products"]
    }
}
```

### Users

The `users` directory contains the example *user* configuration. Users are organized into individual JSON files for each *user*.

```
users
├─ admin.json
└─ GUEST.json
```

#### admin.json

The `admin.json` file contains the example config for the `admin` *user*.

```json
{
    "password": "password",
    "admin_roles": ["admin"]
}
```

### Roles

The `roles` directory contains the example *role* configuration. Roles are organized into individual JSON files for each *role*.

```
roles
└─ admin.json
```

#### admin.json

The `admin.json` file contains the example config for the `admin` *user*.

```json
{
    "admin_channels": ["airports"]
}
```

### sync.js

The `sync.js` file contains the example config for CRUD access control and validation.

```js
function sync(doc, oldDoc, meta) {
    if (doc.type == 'airport') {
        requireRole('admin');
        channel('airports');
    }
}
```