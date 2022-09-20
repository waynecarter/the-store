class App {
    #url = new URL('http://localhost:4984/retail/');

    constructor() {
        const app = this;
        async function refreshCartButton() {
            const cartButton = document.querySelector('header > a.cart');
            if (!cartButton) { return; }
        
            const count = await app.query.cartCount();
            cartButton.innerText = count > 0 ? count : null;
        }

        this.query = new Query(this);
        this.mutation = new Mutation(this, function() {
            refreshCartButton();
        });
        this.ui = new UI();
        
        window.addEventListener('load', () => {
            refreshCartButton();
        }, { once : true });
    }

    async graphql(gql) {
        const response = await fetch(new URL('_graphql', this.#url), {
            method: 'POST',
            mode: 'cors',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Type': 'GraphQL'
            },
            body: JSON.stringify(gql),
        })
        const json = await response.json();

        if (json && json.errors) {
            console.error(JSON.stringify(json.errors));
        }

        return json ? json.data : null;
    }
}

class Query {
    #app = null;

    constructor(app) {
        this.#app = app;
    }

    async products(search, offset, limit) {
        const data = await this.#app.graphql({
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
                offset: offset || 0,
                limit: limit || 20
            }
        }) || {};
        
        return data.products || [];
    }

    async store(id) {
        const data = await this.#app.graphql({
            query: `
                query Store($id: ID!) {
                    store(id: $id) {
                        name
                    }
                }
            `,
            variables: {
                id: id
            }
        }) || {};
        
        return data.store || [];
    }

    async cart() {
        const data = await this.#app.graphql({
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
        const data = await this.#app.graphql({
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
        const data = await this.#app.graphql({
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

    async orders(storeId) {
        const data = await this.#app.graphql({
            query: `
                query Orders($storeId: ID) {
                    orders(storeId: $storeId) {
                        id,
                        status,
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
        
        return data.orders;
    }

    async inventory(storeId) {
        const data = await this.#app.graphql({
            query: `
                query Inventory($storeId: ID) {
                    inventory(storeId: $storeId) {
                        product {
                            name
                            image
                        }
                        quantity
                    }
                }
            `,
            variables: {
                storeId: storeId
            }
        }) || {};
        
        return data.inventory || [];
    }
}

class Mutation {
    #app = null;
    #onCartChange = null;
    
    constructor(app, onCartChange) {
        this.#app = app;
        this.#onCartChange = onCartChange;
    }

    async addToCart(productId) {
        const data = await this.#app.graphql({
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
        const data = await this.#app.graphql({
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
        
        return order;
    }

    async setOrderStatus(orderId, status) {
        const data = await this.#app.graphql({
            query: `
                mutation SetOrderStatus($orderId: ID!, $status: OrderStatus!) {
                    setOrderStatus(orderId: $orderId, status: $status)
                }
            `,
            variables: {
                orderId: orderId,
                status: status
            }
        }) || {};
        
        return data.setOrderStatus;
    }
}

class UI {
    async callFrom(button, func) {
        button.disabled = true;
        const timeout = window.setTimeout(function () {
            button.classList.add('loading');
        }, 200);
        button.innerHTML = `<span>${button.innerText}</span>`;
        
        const result = await func();

        window.clearTimeout(timeout);
        button.classList.remove('loading');
        button.disabled = false;

        if (result) {
            button.classList.add('success');
            window.setTimeout(function () {
                button.classList.remove('success');
            }, 2000);
        }

        return result;
    }
}