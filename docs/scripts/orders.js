class Orders {
    #gatewayUrl = null;

    constructor(gatewayUrl) {
        this.#gatewayUrl = gatewayUrl;
    }
    
    async get(id) {
        const response = await fetch(this.#gatewayUrl, {
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