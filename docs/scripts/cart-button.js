class CartButton {
    #app = null;

    constructor(app) {
        this.#app = app;
    }

    async refresh() {
        const showCartButton = document.getElementById('showCartButton');
        if (!showCartButton) { return; }
    
        const count = await this.#app.cart.getCount();
        showCartButton.innerText = count > 0 ? count : null;
    }
}