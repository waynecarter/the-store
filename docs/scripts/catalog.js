class Catalog {
    #gatewayUrl = null;
    #products = [];
    #search = new Search(this);

    constructor(gatewayUrl) {
        this.#gatewayUrl = gatewayUrl;

        window.addEventListener('load', () => {
            this.fetch();
        }, {
            once : true
        });
    }

    get products() {
        return this.#products;
    }

    async fetch() {
        const catalog = this;
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
                    query products($search: String) {
                        products(search: $search, offset:0, limit:20) {
                            id,
                            name,
                            image,
                            price
                        }
                    }
                `,
                variables: {
                    search: this.#search.searchString
                },
            }),
        })
        .then(function(response) {
            return response.json();
        })
        .then(function(result) {
            const products = result.data ? result.data.products || [] : [];
            catalog.#products = products;
            catalog.#paint();
        });
    }

    #paint() {
        var html = '';
        var products = this.products;
        for (let i = 0; i < products.length; i++) {
            const product = products[i];
            html += `
                <div>
                    <p>${product.image}</p>
                    <h2>${product.name}</h2>
                    <h3>$${product.price}</h3>
                    <button onclick="cart.add('${product.id}')">Add to Bag</button>
                </div>
            `
        }

        const content = document.getElementById('catalogContent');
        content.innerHTML = html;
   }
}

class Search {
    #catalog = null;

    constructor(catalog) {
        this.#catalog = catalog;

        this.#inputText.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                this.#catalog.fetch();
            } else if (event.key === 'Escape') {
                this.#clear();
            }
        });

        this.#inputText.addEventListener('input', () => {
            this.#paint();
        });

        this.#clearButton.addEventListener('click', () => {
            this.#clear();
        });
    }

    get searchString() {
        return this.#inputText.value;
    }

    #clear() {
        this.#inputText.value = null;
        this.#paint();
        this.#catalog.fetch();
    }

    #paint() {
        if (this.#inputText.value.length == 0) {
            this.#clearButton.style.display = 'none';
        } else {
            this.#clearButton.style.display = 'inline-block';
        }
    }

    get #inputText() {
        return document.querySelector('#search > input');
    }

    get #clearButton() {
        return document.querySelector('#search > button');
    }
}