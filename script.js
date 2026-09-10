/* =========================
   CONFIGURAÇÃO DA MEDUSA
========================= */

const MEDUSA_URL = "https://flower-commerce.onrender.com";


const MEDUSA_PUBLISHABLE_KEY = "pk_bfdf9ae998aac94cf927890930f718533d9e59455d551e9121669806e4d5fcf4";

const MEDUSA_REGION_ID =
    "reg_01M23S7H6DXJXP6YCX4FVD4Q27";


/* =========================
   ELEMENTOS DA PÁGINA
========================= */

const cartItems =
    document.querySelector("#cart-items");

const cartSummary =
    document.querySelector("#cart-summary");

const cartLink =
    document.querySelector("#cart-link");

const cart =
    document.querySelector("#cart");

const cartOverlay =
    document.querySelector("#cart-overlay");

const cartClose =
    document.querySelector("#cart-close");

const productsContainer =
    document.querySelector(".products");


/* =========================
   DADOS
========================= */

let produtos = [];

let banners = [];

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
   OBTER IMAGEM
========================= */

function obterImagem(produto) {

    if (
        produto.thumbnail &&
        typeof produto.thumbnail === "string"
    ) {

        return produto.thumbnail;

    }


    if (
        produto.images &&
        produto.images.length > 0 &&
        produto.images[0]?.url
    ) {

        return produto.images[0].url;

    }


    if (
        produto.variants &&
        produto.variants.length > 0
    ) {

        for (
            const variante of produto.variants
        ) {

            if (
                variante.images &&
                variante.images.length > 0 &&
                variante.images[0]?.url
            ) {

                return variante.images[0].url;

            }

        }

    }


    return "";

}


/* =========================
   CARREGAR PRODUTOS
========================= */

async function carregarProdutos() {

    try {

        console.log(
            "Conectando à Medusa:",
            MEDUSA_URL
        );


        if (productsContainer) {

            productsContainer.innerHTML = `
                <p class="loading-products">
                    CARREGANDO PRODUTOS...
                </p>
            `;

        }


        const resposta = await fetch(

            `${MEDUSA_URL}/store/products?fields=*variants.calculated_price,*images,*variants.images&region_id=${MEDUSA_REGION_ID}`,

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
   CARREGAR BANNERS
========================= */

async function carregarBanners() {

    try {

        console.log(
            "Carregando banners da Medusa..."
        );


        const resposta =
            await fetch(
                `${MEDUSA_URL}/store/custom`,
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


        console.log(
            "Status da resposta dos banners:",
            resposta.status
        );


        /*
           Primeiro verificamos a resposta como TEXTO.

           Isso evita o erro:

           Unexpected token 'O', "OK" is not valid JSON

           porque a API pode responder "OK"
           em vez de JSON.
        */

        const textoResposta =
            await resposta.text();


        console.log(
            "Resposta bruta dos banners:",
            textoResposta
        );


        if (!resposta.ok) {

            console.error(
                "Erro ao buscar banners:",
                resposta.status,
                textoResposta
            );

            return;

        }


        /*
           Se a resposta estiver vazia,
           não tentamos transformar em JSON.
        */

        if (!textoResposta.trim()) {

            console.warn(
                "A API respondeu vazia para os banners."
            );

            banners = [];

            mostrarBanners();

            return;

        }


        /*
           Tentamos transformar a resposta
           em JSON somente se ela realmente
           estiver em formato JSON.
        */

        let dados;

        try {

            dados =
                JSON.parse(textoResposta);

        } catch (erroJson) {

            console.warn(
                "A rota de banners não retornou JSON.",
                "Resposta recebida:",
                textoResposta
            );


            /*
               Caso a API responda simplesmente "OK",
               não quebramos o restante do site.

               Mantemos o banner padrão do HTML.
            */

            banners = [];

            return;

        }


        console.log(
            "Banners recebidos:",
            dados
        );


        banners =
            Array.isArray(dados.banners)
                ? dados.banners
                : [];


        console.log(
            "Quantidade de banners:",
            banners.length
        );


        mostrarBanners();


    } catch (erro) {

        console.error(
            "Erro ao conectar com os banners:",
            erro
        );

    }

}


/* =========================
   MOSTRAR BANNERS
========================= */

function mostrarBanners() {

    const bannerContainer =
        document.querySelector(
            "#banner-container"
        );


    if (!bannerContainer) {

        console.error(
            "Elemento #banner-container não encontrado."
        );

        return;

    }


    /*
       Se nenhum banner veio da API,
       mantemos o banner padrão do HTML.
    */

    if (banners.length === 0) {

        console.log(
            "Nenhum banner válido recebido. Mantendo banner padrão."
        );

        return;

    }


    const banner =
        banners[0];


    /*
       Verificação de segurança:
       precisamos ter uma imagem válida.
    */

    if (
        !banner ||
        !banner.image_url
    ) {

        console.warn(
            "Banner recebido sem image_url:",
            banner
        );

        return;

    }


    bannerContainer.innerHTML = `

        <img
            src="${banner.image_url}"
            alt="${banner.title || "Campanha FLOWER"}"
        >


        <div class="hero-info">

            ${
                banner.description
                    ? `
                        <span>
                            ${banner.description}
                        </span>
                    `
                    : ""
            }


            <h2>
                ${banner.title || ""}
            </h2>


            ${
                banner.button_text
                    ? `
                        <a
                            href="${banner.link || "#"}"
                            class="btn"
                        >
                            ${banner.button_text}
                        </a>
                    `
                    : ""
            }

        </div>


        <div class="hero-number">

            01 / ${String(
                banners.length
            ).padStart(2, "0")}

        </div>

    `;


    console.log(
        "Banner exibido:",
        banner
    );

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


    productsContainer.innerHTML = "";


    if (produtos.length === 0) {

        productsContainer.innerHTML = `
            <p>
                Nenhum produto disponível.
            </p>
        `;

        return;

    }


    produtos.forEach(
        function (produto) {

            const imagem =
                obterImagem(produto);


            const preco =
                obterPreco(produto);


            const card =
                document.createElement(
                    "article"
                );


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
                                    decoding="async"
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


            const imagemElemento =
                card.querySelector(
                    ".product-image img"
                );


            if (imagemElemento) {

                imagemElemento.addEventListener(
                    "load",
                    function () {

                        imagemElemento.classList.add(
                            "image-loaded"
                        );

                    }
                );


                imagemElemento.addEventListener(
                    "error",
                    function () {

                        console.error(
                            "Erro ao carregar imagem:",
                            imagem
                        );


                        const container =
                            imagemElemento.parentElement;


                        container.innerHTML = `
                            <div class="no-image">
                                IMAGEM INDISPONÍVEL
                            </div>
                        `;

                    }
                );

            }


            productsContainer.appendChild(
                card
            );


            const botao =
                card.querySelector(
                    ".add-bag"
                );


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

        }
    );

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
        carrinho.find(
            function (item) {

                return item.id === produto.id;

            }
        );


    if (produtoExistente) {

        produtoExistente.quantidade++;

    } else {

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
                obterImagem(produto),

            quantidade:
                1

        });

    }


    atualizarQuantidadeSacola();

    mostrarCarrinho();

    abrirSacola();

}


/* =========================
   ABRIR SACOLA
========================= */

function abrirSacola() {

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
   FECHAR SACOLA
========================= */

function fecharSacola() {

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


/* =========================
   BOTÃO SACOLA
========================= */

if (cartLink) {

    cartLink.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

            abrirSacola();

        }
    );

}


/* =========================
   BOTÃO FECHAR
========================= */

if (cartClose) {

    cartClose.addEventListener(
        "click",
        function () {

            fecharSacola();

        }
    );

}


/* =========================
   CLICAR FORA
========================= */

if (cartOverlay) {

    cartOverlay.addEventListener(
        "click",
        function () {

            fecharSacola();

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

                    fecharSacola();

                }
            );

        }


        return;

    }


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
                                    loading="lazy"
                                    decoding="async"
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


            /* DIMINUIR */

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


            /* AUMENTAR */

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


            /* REMOVER */

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


            cartItems.appendChild(
                item
            );


            total +=
                produto.preco *
                produto.quantidade;

        }
    );


    /* =========================
       RESUMO
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
            id="checkout-button"
        >
            FINALIZAR PEDIDO
        </button>

    `;


    const checkoutButton =
        document.querySelector(
            "#checkout-button"
        );


    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            function () {

                alert(
                    "O checkout será configurado na próxima etapa."
                );

            }
        );

    }

}


/* =========================
   INICIALIZAÇÃO
========================= */

console.log(
    "TESTE FLOWER 123"
);


/*
   Produtos e banners são carregados
   separadamente.
*/

carregarProdutos();


console.log(
    "Iniciando carregamento dos banners..."
);


carregarBanners();