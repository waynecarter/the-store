class App {
    constructor(url) {
        if (!url.endsWith('/_graphql')) {
            if (!url.endsWith('/')) { url += '/'; }
            url += '_graphql';
        }

        this.products = new Products(url);
        this.cart = new Cart(url);
        this.checkout = new Checkout(url);
        this.orders = new Orders(url);
    }
}

class Products {
    #url = null;

    constructor(url) {
        this.#url = url;
    }

    async find(search) {
        const response = await fetch(this.#url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Type': 'GraphQL',
                'Authorization': 'Basic ' + btoa('admin:password')
            },
            body: JSON.stringify({
                query: `
                    query Products($search: String) {
                        products(search: $search, offset:0, limit:20) {
                            id,
                            name,
                            image,
                            price
                        }
                    }
                `,
                variables: {
                    search: search
                }
            }),
        })
        const json = await response.json();
        const products = json.data ? json.data.products || [] : [];
        
        return products;
    }
}

class Cart {
    #url = null;

    constructor(url) {
        this.#url = url;
    }

    async get() {
        const response = await fetch(this.#url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Type': 'GraphQL',
                'Authorization': 'Basic ' + btoa('admin:password')
            },
            body: JSON.stringify({
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
            }),
        });
        const json = await response.json();
        const cart = json.data ? json.data.cart || {} : {};
        
        return cart;
    }

    async getCount() {
        const response = await fetch(this.#url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Type': 'GraphQL',
                'Authorization': 'Basic ' + btoa('admin:password')
            },
            body: JSON.stringify({
                query: `{
                    cart {
                        count
                    }
                }`
            }),
        });
        const json = await response.json();
        const cart = json.data ? json.data.cart || {} : {};
        
        return cart.count || 0;
    }
    
    async addProduct(productId) {
        const response = await fetch(this.#url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Type': 'GraphQL',
                'Authorization': 'Basic ' + btoa('admin:password')
            },
            body: JSON.stringify({
                query: `
                    mutation AddToCart($productId: ID!) {
                        addToCart(productId: $productId)
                    }
                `,
                variables: {
                    productId: productId
                },
            }),
        });
        const json = await response.json();
        const success = json.data ? json.data.addToCart == true : false;
        
        if (success) {
            this.refreshButton();
        }

        return success;
    }

    async refreshButton() {
        const showCartButton = document.getElementById('showCartButton');
        if (!showCartButton) { return; }
    
        const count = await this.getCount();
        showCartButton.innerText = count > 0 ? count : null;
    }
}

class Checkout {
    #url = null;

    constructor(url) {
        this.#url = url;
    }
    
    async orderCart(storeId) {
        const response = await fetch(this.#url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Type': 'GraphQL',
                'Authorization': 'Basic ' + btoa('admin:password')
            },
            body: JSON.stringify({
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
            }),
        })
        const result = await response.json();
        const order = result.data ? result.data.orderCart : null;

        return order;
    }
}

class Orders {
    #url = null;

    constructor(url) {
        this.#url = url;
    }

    async get(id) {
        const response = await fetch(this.#url, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Type': 'GraphQL',
                'Authorization': 'Basic ' + btoa('admin:password')
            },
            body: JSON.stringify({
                query: `
                    query Order($id: ID!) {
                        order(id: $id) {
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
                    id: id
                }
            }),
        });
        const json = await response.json();
        const order = json.data ? json.data.order : null;

        return order;
    }
}