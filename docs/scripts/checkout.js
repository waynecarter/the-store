class Checkout {
    #gatewayUrl = null;

    constructor(gatewayUrl) {
        this.#gatewayUrl = gatewayUrl;
    }
    
    async orderCart(storeId) {
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