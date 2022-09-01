class Cart {
    #gatewayUrl = null;
    #items = {};
    #count = 0;

    constructor(gatewayUrl) {
        this.#gatewayUrl = gatewayUrl;
        this.#fetch();
    }

    get items() {
        return this.#items;
    }

    get count() {
        return this.#count;
    }

    async #fetch() {
        const cart = this;
        fetch(this.#gatewayUrl, {
            method: 'POST',
            mode: 'cors',
            headers: {
                'Content-Type': 'application/json',
                'X-Request-Type': 'GraphQL',
                'Authorization': 'Basic ' + btoa('admin:password')
            },
            body: JSON.stringify({
                query: (
                    function() {
                        const cartContent = document.getElementById('cartContent');
                        switch (cartContent != null) {
                            case true: return `{
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
                            default: return `{
                                cart {
                                    count
                                }
                            }`
                        }
                    }
                )()
            }),
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            if (result.error || result.errors) {
                alert(JSON.stringify(result));
            } else {
                const cartObject = result.data ? result.data.cart || [] : [];
                cart.#items = cartObject.items || [];
                cart.#count = cartObject.count || 0;
                cart.#paint();
            }
        });
    }
    
    async add(productId) {
        const cart = this;

        fetch(this.#gatewayUrl, {
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
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            const success = result.data ? result.data.addToCart == true : false;
            if (success) {
                cart.#fetch();
            }
        });
    }

    #paint() {
        this.#paintCount();
        this.#paintItems();
    }

    #paintCount() {
        const showCartButton = document.getElementById('showCartButton');
        if (!showCartButton) { return; }

        showCartButton.innerText = this.count;
    }

    #paintItems() {
        const content = document.getElementById('cartContent');
        if (!content) { return; }

        if (this.items.length > 0) {
            var html = '';
            this.items.forEach(item => {
                html += `
                <div>
                    <span>${item.product.image} <b>${item.product.name}</b>${item.count > 1 ? ' ✕ ' + item.count : ''}</span>
                </div>`
            });

            html += `<a class="button">Check Out</a>`

            content.innerHTML = html;
        } else {
            const subheaderLabel = document.querySelector('#subheader h2');
            subheaderLabel.innerText = 'Your bag is empty.'
            content.innerHTML = '<a class="button" href="index.html">Continue Shopping</a>';
        }
        
        
    }
}