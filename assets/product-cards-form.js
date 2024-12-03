document.querySelectorAll(".product-card form").forEach((form) => {
	form.addEventListener("submit", async function (event) {
		event.preventDefault(); // Impedisce il comportamento di submit predefinito

		const formData = new FormData(form);
		try {
			// Aggiunta prodotto al carrello
			const response = await WAU.ThemeCart.addItemFromForm(form);
			console.log("Prodotto aggiunto:", response);

			// Recupera il carrello aggiornato
			const cart = await WAU.ThemeCart.getCart();

			// Aggiorna la vista del carrello
			const config = JSON.parse(
				document.getElementById("cart-config").innerHTML || "{}"
			);
			WAU.AjaxCart.updateView(config, cart);

			// Mostra il carrello
			if (config.cart_action === "drawer") {
				WAU.AjaxCart.showDrawer(config);
			} else if (config.cart_action === "modal_cart") {
				WAU.AjaxCart.showModal(config);
			} else {
				console.log("Configurazione del carrello non supportata.");
			}
		} catch (error) {
			console.error("Errore:", error.message);
			alert("C'è stato un problema durante l'aggiunta al carrello.");
		}
	});
});

document
	.querySelectorAll(".product-card .quantity-wrapper")
	.forEach((wrapper) => {
		const input = wrapper.querySelector(".quantity-input");
		const buttons = wrapper.querySelectorAll(".quantity-btn");

		buttons.forEach((button) => {
			button.addEventListener("click", () => {
				const action = button.getAttribute("data-action");
				let currentValue = parseInt(input.value) || 1;

				if (action === "increase") {
					input.value = currentValue + 1;
				} else if (action === "decrease" && currentValue > 1) {
					input.value = currentValue - 1;
				}
			});
		});
	});
