class App {
    #url = new URL('http://localhost:4984/retail/_graphql');

    constructor() {
        const app = this;
        async function refreshCartButton() {
            const cartButton = document.querySelector('header > a.cart');
            if (!cartButton) { return; }
        
            const count = await app.query.cartCount();
            cartButton.innerText = count > 0 ? count : null;
        }

        this.query = new Query(this.#url);
        this.mutation = new Mutation(this.#url, function() {
            refreshCartButton();
        });

        window.addEventListener('load', () => {
            refreshCartButton();
        }, { once : true });
    }
}

class GraphQL {
    #url = null;

    constructor(url) {
        this.#url = url;
    }

    async query(gql) {
        const response = await fetch(this.#url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Type': 'GraphQL',
                'Authorization': 'Basic ' + btoa('admin:password')
            },
            body: JSON.stringify(gql),
        })
        const json = await response.json();
        return json ? json.data : null;
    }
}

class Query extends GraphQL {
    async products(search, offset, limit) {
        const data = await super.query({
            query: `
                query Products($search: String, $offset: Int, $limit: Int) {
                    products(search: $search, offset: $offset, limit: $limit) {
                        id,
                        name,
                        image,
                        price
                    }
                }
            `,
            variables: {
                search: search,
                offset: `${offset || 0}`,
                limit: `${limit || 20}`
            }
        }) || {};
        
        return data.products || [];
    }

    async cart() {
        const data = await super.query({
            query: `{
                cart {
                    items {
                        product {
                            id,
                            name,
                            image,
                            price
                        },
                        count
                    },
                    count
                }
            }`
        }) || {};
        
        return data.cart || {};
    }

    async cartCount() {
        const data = await super.query({
            query: `{
                cart {
                    count
                }
            }`
        }) || {};
        const cart = data.cart || {};
        const count = cart.count || 0;
        
        return count;
    }

    async order(id) {
        const data = await super.query({
            query: `
                query Order($id: ID!) {
                    order(id: $id) {
                        id,
                        status,
                        store {
                            id,
                            name,
                            email
                        },
                        items {
                            product {
                                id,
                                name,
                                image,
                                price
                            },
                            count
                        }
                    }
                }
            `,
            variables: {
                id: id
            }
        }) || {};
        
        return data.order;
    }
}

class Mutation extends GraphQL {
    #onCartChange = null;

    constructor(url, onCartChange) {
        super(url);
        this.#onCartChange = onCartChange;
    }

    async addToCart(productId) {
        const data = await super.query({
            query: `
                mutation AddToCart($productId: ID!) {
                    addToCart(productId: $productId)
                }
            `,
            variables: {
                productId: productId
            },
        }) || {};
        const success = data.addToCart == true;
        
        if (success) {
            this.#onCartChange();
        }

        return success;
    }

    async orderCart(storeId) {
        const data = await super.query({
            query: `
                mutation OrderCart($storeId: ID!) {
                    orderCart(storeId: $storeId) {
                        id,
                        store {
                            id,
                            name,
                            email
                        },
                        items {
                            product {
                                id,
                                name,
                                image,
                                price
                            },
                            count
                        }
                    }
                }
            `,
            variables: {
                storeId: storeId
            }
        }) || {};
        const order = data.orderCart;

        if (order) {
            this.#onCartChange();
        }
        
        return data.orderCart;
    }
}