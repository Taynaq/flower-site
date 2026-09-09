/* =========================
   CONFIGURAÇÃO DA MEDUSA
========================= */

// Medusa ONLINE
const MEDUSA_URL = "https://flower-commerce.onrender.com";

const MEDUSA_PUBLISHABLE_KEY =
    "pk_bfdf9ae998aac94cf927890930f718533d9e59455d551e9121669806e4d5fcf4";

const MEDUSA_REGION_ID =
    "reg_01M23S7H6DXJXP6YCX4FVD4Q27";

/* =========================
   ELEMENTOS DA PÁGINA
========================= */

const cartItems = document.querySelector("#cart-items");
const cartSummary = document.querySelector("#cart-summary");

const cartLink = document.querySelector("#cart-link");
const cart = document.querySelector("#cart");
const cartOverlay = document.querySelector("#cart-overlay");
const cartClose = document.querySelector("#cart-close");

const productsContainer =
    document.querySelector(".products");


/* =========================
   PRODUTOS DA MEDUSA
========================= */

let produtos = [];


/* =========================
   CARRINHO
========================= */

const carrinho = [];


/* =========================
   FORMATAR PREÇO
========================= */

function formatarPreco(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


/* =========================
   OBTER PREÇO
========================= */

function obterPreco(produto) {

    const variante =
        produto.variants?.[0];

    if (!variante) {
        return 0;
    }

    const valor =
        variante.calculated_price?.calculated_amount;

    if (typeof valor !== "number") {
        return 0;
    }

    return valor;

}


/* =========================
   CARREGAR PRODUTOS DA MEDUSA
========================= */

async function carregarProdutos() {

    try {

        console.log(
            "Conectando à Medusa:",
            MEDUSA_URL
        );


        const resposta = await fetch(
            `${MEDUSA_URL}/store/products?fields=*variants.calculated_price&region_id=${MEDUSA_REGION_ID}`,
            {
                method: "GET",

                headers: {
                    "x-publishable-api-key":
                        MEDUSA_PUBLISHABLE_KEY,

                    "Content-Type":
                        "application/json"
                }
            }
        );


        /* =========================
           VERIFICAR RESPOSTA
        ========================= */

        if (!resposta.ok) {

            const erro =
                await resposta.text();

            console.error(
                "Erro ao buscar produtos da Medusa:",
                resposta.status,
                erro
            );

            if (productsContainer) {

                productsContainer.innerHTML = `
                    <p>
                        Não foi possível carregar os produtos.
                    </p>
                `;

            }

            return;

        }


        /* =========================
           CONVERTER RESPOSTA
        ========================= */

        const dados =
            await resposta.json();


        console.log(
            "Resposta da Medusa:",
            dados
        );


        produtos =
            dados.products || [];


        console.log(
            "Produtos carregados da Medusa:",
            produtos
        );


        /* =========================
           MOSTRAR PRODUTOS
        ========================= */

        mostrarProdutos();


    } catch (erro) {

        console.error(
            "Erro ao conectar com a Medusa:",
            erro
        );


        if (productsContainer) {

            productsContainer.innerHTML = `
                <p>
                    Erro ao conectar com a loja.
                </p>
            `;

        }

    }

}


/* =========================
   MOSTRAR PRODUTOS
========================= */

function mostrarProdutos() {

    if (!productsContainer) {

        console.error(
            "Elemento .products não encontrado no HTML."
        );

        return;

    }


    /* =========================
       LIMPAR PRODUTOS ANTIGOS
    ========================= */

    productsContainer.innerHTML = "";


    /* =========================
       NENHUM PRODUTO
    ========================= */

    if (produtos.length === 0) {

        productsContainer.innerHTML = `
            <p>
                Nenhum produto disponível.
            </p>
        `;

        return;

    }


    /* =========================
       CRIAR CARDS
    ========================= */

    produtos.forEach(function (produto) {

        const imagem =
            produto.thumbnail ||
            produto.images?.[0]?.url ||
            "";


        const preco =
            obterPreco(produto);


        const card =
            document.createElement("article");


        card.classList.add(
            "product-card"
        );


        card.innerHTML = `

            <div class="product-image">

                ${
                    imagem
                        ? `
                            <img
                                src="${imagem}"
                                alt="${produto.title}"
                                loading="lazy"
                            >
                        `
                        : `
                            <div class="no-image">
                                SEM IMAGEM
                            </div>
                        `
                }

            </div>


            <div class="product-info">

                <h3>
                    ${produto.title}
                </h3>


                <p>
                    ${formatarPreco(preco)}
                </p>


                <button
                    class="add-bag"
                    data-product-id="${produto.id}"
                >
                    ADD TO BAG
                </button>

            </div>

        `;


        /* =========================
           ADICIONAR CARD
        ========================= */

        productsContainer.appendChild(
            card
        );


        /* =========================
           BOTÃO ADD TO BAG
        ========================= */

        const botao =
            card.querySelector(".add-bag");


        if (botao) {

            botao.addEventListener(
                "click",
                function () {

                    adicionarAoCarrinho(
                        produto
                    );

                }
            );

        }

    });

}


/* =========================
   ADICIONAR AO CARRINHO
========================= */

function adicionarAoCarrinho(produto) {

    const variante =
        produto.variants?.[0];


    if (!variante) {

        console.error(
            "Produto sem variante:",
            produto
        );

        return;

    }


    const preco =
        obterPreco(produto);


    const produtoExistente =
        carrinho.find(function (item) {

            return item.id === produto.id;

        });


    /* =========================
       PRODUTO JÁ EXISTE
    ========================= */

    if (produtoExistente) {

        produtoExistente.quantidade++;

    }


    /* =========================
       NOVO PRODUTO
    ========================= */

    else {

        carrinho.push({

            id:
                produto.id,

            variantId:
                variante.id,

            nome:
                produto.title,

            preco:
                preco,

            imagem:
                produto.thumbnail ||
                produto.images?.[0]?.url ||
                "",

            quantidade:
                1

        });

    }


    /* =========================
       ATUALIZAR CARRINHO
    ========================= */

    atualizarQuantidadeSacola();

    mostrarCarrinho();


    /* =========================
       ABRIR SACOLA
    ========================= */

    if (cart) {

        cart.classList.add(
            "active"
        );

    }


    if (cartOverlay) {

        cartOverlay.classList.add(
            "active"
        );

    }

}


/* =========================
   ABRIR SACOLA
========================= */

if (cartLink) {

    cartLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            if (cart) {

                cart.classList.add(
                    "active"
                );

            }


            if (cartOverlay) {

                cartOverlay.classList.add(
                    "active"
                );

            }

        }
    );

}


/* =========================
   FECHAR SACOLA
========================= */

if (cartClose) {

    cartClose.addEventListener(
        "click",
        function () {

            if (cart) {

                cart.classList.remove(
                    "active"
                );

            }


            if (cartOverlay) {

                cartOverlay.classList.remove(
                    "active"
                );

            }

        }
    );

}


/* =========================
   FECHAR AO CLICAR FORA
========================= */

if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        function () {

            if (cart) {

                cart.classList.remove(
                    "active"
                );

            }


            cartOverlay.classList.remove(
                "active"
            );

        }
    );

}


/* =========================
   CALCULAR QUANTIDADE
========================= */

function calcularQuantidade() {

    let quantidadeTotal = 0;


    carrinho.forEach(
        function (produto) {

            quantidadeTotal +=
                produto.quantidade;

        }
    );


    return quantidadeTotal;

}


/* =========================
   ATUALIZAR CONTADOR
========================= */

function atualizarQuantidadeSacola() {

    const contador =
        document.querySelector(
            "#cart-count"
        );


    if (contador) {

        contador.textContent =
            calcularQuantidade();

    }

}


/* =========================
   MOSTRAR CARRINHO
========================= */

function mostrarCarrinho() {

    if (!cartItems || !cartSummary) {

        console.error(
            "Elementos do carrinho não encontrados."
        );

        return;

    }


    cartItems.innerHTML = "";

    cartSummary.innerHTML = "";


    /* =========================
       CARRINHO VAZIO
    ========================= */

    if (carrinho.length === 0) {

        cartItems.innerHTML = `

            <div class="empty-cart">

                <h3>
                    SUA SACOLA ESTÁ VAZIA
                </h3>


                <p>
                    Você ainda não adicionou nenhum produto.
                </p>


                <button
                    class="continue-shopping"
                    id="continue-shopping"
                >
                    CONTINUAR COMPRANDO
                </button>

            </div>

        `;


        const continueShopping =
            document.querySelector(
                "#continue-shopping"
            );


        if (continueShopping) {

            continueShopping.addEventListener(
                "click",
                function () {

                    if (cart) {

                        cart.classList.remove(
                            "active"
                        );

                    }


                    if (cartOverlay) {

                        cartOverlay.classList.remove(
                            "active"
                        );

                    }

                }
            );

        }


        return;

    }


    /* =========================
       PRODUTOS DO CARRINHO
    ========================= */

    let total = 0;


    carrinho.forEach(
        function (produto, index) {

            const item =
                document.createElement(
                    "div"
                );


            item.classList.add(
                "cart-item"
            );


            item.innerHTML = `

                <div class="cart-product">

                    ${
                        produto.imagem
                            ? `
                                <img
                                    src="${produto.imagem}"
                                    alt="${produto.nome}"
                                    class="cart-product-image"
                                >
                            `
                            : ""
                    }


                    <div class="cart-product-info">

                        <h3>
                            ${produto.nome}
                        </h3>


                        <p>
                            ${formatarPreco(
                                produto.preco
                            )}
                        </p>


                        <div class="quantity-controls">

                            <button
                                class="quantity-minus"
                            >
                                −
                            </button>


                            <span>
                                ${produto.quantidade}
                            </span>


                            <button
                                class="quantity-plus"
                            >
                                +
                            </button>

                        </div>


                        <button
                            class="remove-item"
                        >
                            REMOVER
                        </button>

                    </div>

                </div>

            `;


            /* =========================
               DIMINUIR QUANTIDADE
            ========================= */

            const botaoMenos =
                item.querySelector(
                    ".quantity-minus"
                );


            if (botaoMenos) {

                botaoMenos.addEventListener(
                    "click",
                    function () {

                        produto.quantidade--;


                        if (
                            produto.quantidade <= 0
                        ) {

                            carrinho.splice(
                                index,
                                1
                            );

                        }


                        atualizarQuantidadeSacola();

                        mostrarCarrinho();

                    }
                );

            }


            /* =========================
               AUMENTAR QUANTIDADE
            ========================= */

            const botaoMais =
                item.querySelector(
                    ".quantity-plus"
                );


            if (botaoMais) {

                botaoMais.addEventListener(
                    "click",
                    function () {

                        produto.quantidade++;


                        atualizarQuantidadeSacola();

                        mostrarCarrinho();

                    }
                );

            }


            /* =========================
               REMOVER PRODUTO
            ========================= */

            const botaoRemover =
                item.querySelector(
                    ".remove-item"
                );


            if (botaoRemover) {

                botaoRemover.addEventListener(
                    "click",
                    function () {

                        carrinho.splice(
                            index,
                            1
                        );


                        atualizarQuantidadeSacola();

                        mostrarCarrinho();

                    }
                );

            }


            /* =========================
               ADICIONAR ITEM
            ========================= */

            cartItems.appendChild(
                item
            );


            /* =========================
               CALCULAR TOTAL
            ========================= */

            total +=
                produto.preco *
                produto.quantidade;

        }
    );


    /* =========================
       RESUMO DA COMPRA
    ========================= */

    cartSummary.innerHTML = `

        <div class="summary-line">

            <span>
                SUBTOTAL
            </span>


            <span>
                ${formatarPreco(total)}
            </span>

        </div>


        <div class="summary-total">

            <span>
                TOTAL
            </span>


            <span>
                ${formatarPreco(total)}
            </span>

        </div>


        <button
            class="checkout-button"
        >
            FINALIZAR PEDIDO
        </button>

    `;

}


/* =========================
   INICIAR SITE
========================= */

carregarProdutos();