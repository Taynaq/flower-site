const checkoutItems = document.querySelector("#checkout-items");
const checkoutTotal = document.querySelector("#checkout-total");

const carrinhoSalvo = localStorage.getItem("flowerCarrinho");

if (!carrinhoSalvo) {
    checkoutItems.innerHTML = "<p>Seu pedido está vazio.</p>";
} else {
    const carrinho = JSON.parse(carrinhoSalvo);

    let total = 0;

    checkoutItems.innerHTML = "";

    carrinho.forEach((produto) => {
        const subtotal = produto.preco * produto.quantidade;

        total += subtotal;

        const item = document.createElement("div");

        item.classList.add("checkout-item");

        item.innerHTML = `
            <div>
                <strong>${produto.nome}</strong>
                <p>Quantidade: ${produto.quantidade}</p>
            </div>

            <span>
                R$ ${subtotal.toFixed(2).replace(".", ",")}
            </span>
        `;

        checkoutItems.appendChild(item);
    });

    checkoutTotal.textContent =
        `R$ ${total.toFixed(2).replace(".", ",")}`;
}