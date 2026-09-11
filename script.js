/* =========================
   CONFIGURAÇÃO DO SUPABASE
========================= */
const SUPABASE_URL = "https://awnswqbjspexvroatkyk.supabase.co";
const SUPABASE_KEY = "sb_publishable_23V70RTA0STgz3bT0_uuDA_-TE8E7nt";


const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


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

let bannerAtual = 0;

let intervaloBanners = null;

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
   VERIFICAR USUÁRIO LOGADO
========================= */

async function verificarUsuario() {

    try {

        const {
            data,
            error
        } = await supabaseClient.auth.getUser();


        if (error) {

            console.error(
                "Erro ao verificar usuário:",
                error
            );

            atualizarMenuUsuario(null);

            return;

        }


        const usuario =
            data?.user || null;


        console.log(
            "Usuário atual:",
            usuario
        );


        atualizarMenuUsuario(
            usuario
        );


    } catch (erro) {

        console.error(
            "Erro ao verificar sessão:",
            erro
        );

        atualizarMenuUsuario(null);

    }

}


/* =========================
   ATUALIZAR MENU DO USUÁRIO
========================= */

function atualizarMenuUsuario(usuario) {

    const accountLink =
        document.querySelector(
            "#account-link"
        );


    if (!accountLink) {

        console.warn(
            "Elemento #account-link não encontrado."
        );

        return;

    }


    /* =========================
       USUÁRIO NÃO LOGADO
    ========================= */

    if (!usuario) {

        accountLink.textContent =
            "ACCOUNT";

        accountLink.href =
            "./login.html";

        return;

    }


    /* =========================
       OBTER NOME
    ========================= */

    const nome =
        usuario.user_metadata?.nome ||
        usuario.email?.split("@")[0] ||
        "ACCOUNT";


    /* =========================
       MOSTRAR NOME
    ========================= */

    accountLink.textContent =
        nome.toUpperCase();

    accountLink.href =
        "./conta.html";


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

            `${MEDUSA_URL}/store/products?fields=*variants.calculated_price,*images,*variants.images,*categories&region_id=${MEDUSA_REGION_ID}`,

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


        if (!textoResposta.trim()) {

            console.warn(
                "A API respondeu vazia para os banners."
            );

            banners = [];

            return;

        }


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


        banners.sort(
            function (a, b) {

                return (
                    (a.sort_order || 0) -
                    (b.sort_order || 0)
                );

            }
        );


        console.log(
            "Quantidade de banners:",
            banners.length
        );


        bannerAtual = 0;


        mostrarBanners();

        iniciarCarrossel();


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


    const bannerNumber =
        document.querySelector(
            "#banner-number"
        );


    const bannerDots =
        document.querySelector(
            "#banner-dots"
        );


    if (!bannerContainer) {

        console.error(
            "Elemento #banner-container não encontrado."
        );

        return;

    }


    if (banners.length === 0) {

        console.log(
            "Nenhum banner disponível."
        );

        return;

    }


    if (bannerAtual >= banners.length) {

        bannerAtual = 0;

    }


    if (bannerAtual < 0) {

        bannerAtual =
            banners.length - 1;

    }


    const banner =
        banners[bannerAtual];


    if (
        !banner ||
        !banner.image_url
    ) {

        console.warn(
            "Banner sem imagem:",
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

            ${
                banner.title
                    ? `
                        <h2>
                            ${banner.title}
                        </h2>
                    `
                    : ""
            }

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

    `;


    if (bannerNumber) {

        bannerNumber.textContent =
            `${String(
                bannerAtual + 1
            ).padStart(2, "0")} / ${String(
                banners.length
            ).padStart(2, "0")}`;

    }


    if (bannerDots) {

        bannerDots.innerHTML = "";


        banners.forEach(
            function (_, index) {

                const dot =
                    document.createElement(
                        "button"
                    );


                dot.classList.add(
                    "banner-dot"
                );


                if (
                    index === bannerAtual
                ) {

                    dot.classList.add(
                        "active"
                    );

                }


                dot.setAttribute(
                    "aria-label",
                    `Ir para o banner ${index + 1}`
                );


                dot.addEventListener(
                    "click",
                    function () {

                        bannerAtual =
                            index;

                        mostrarBanners();

                        reiniciarCarrossel();

                    }
                );


                bannerDots.appendChild(
                    dot
                );

            }
        );

    }


    console.log(
        "Banner exibido:",
        bannerAtual + 1,
        banner
    );

}


/* =========================
   PRÓXIMO BANNER
========================= */

function proximoBanner() {

    if (banners.length === 0) {
        return;
    }


    bannerAtual++;


    if (
        bannerAtual >= banners.length
    ) {

        bannerAtual = 0;

    }


    mostrarBanners();

}


/* =========================
   BANNER ANTERIOR
========================= */

function bannerAnterior() {

    if (banners.length === 0) {
        return;
    }


    bannerAtual--;


    if (bannerAtual < 0) {

        bannerAtual =
            banners.length - 1;

    }


    mostrarBanners();

}


/* =========================
   INICIAR CARROSSEL
========================= */

function iniciarCarrossel() {

    pararCarrossel();


    intervaloBanners =
        setInterval(
            function () {

                proximoBanner();

            },
            5000
        );

}


/* =========================
   PARAR CARROSSEL
========================= */

function pararCarrossel() {

    if (intervaloBanners) {

        clearInterval(
            intervaloBanners
        );

        intervaloBanners = null;

    }

}


/* =========================
   REINICIAR CARROSSEL
========================= */

function reiniciarCarrossel() {

    pararCarrossel();

    iniciarCarrossel();

}


/* =========================
   SETA ESQUERDA
========================= */

const bannerPrev =
    document.querySelector(
        "#banner-prev"
    );


if (bannerPrev) {

    bannerPrev.addEventListener(
        "click",
        function () {

            bannerAnterior();

            reiniciarCarrossel();

        }
    );

}


/* =========================
   SETA DIREITA
========================= */

const bannerNext =
    document.querySelector(
        "#banner-next"
    );


if (bannerNext) {

    bannerNext.addEventListener(
        "click",
        function () {

            proximoBanner();

            reiniciarCarrossel();

        }
    );

}


/* =========================
   PAUSAR AO PASSAR O MOUSE
========================= */

const hero =
    document.querySelector(
        "#hero"
    );


if (hero) {

    hero.addEventListener(
        "mouseenter",
        function () {

            pararCarrossel();

        }
    );


    hero.addEventListener(
        "mouseleave",
        function () {

            iniciarCarrossel();

        }
    );

}


/* =========================
   MOSTRAR PRODUTOS
========================= */

function mostrarProdutos(
    categoria = "all"
) {

    if (!productsContainer) {

        console.error(
            "Elemento .products não encontrado no HTML."
        );

        return;

    }


    productsContainer.innerHTML = "";


    const produtosFiltrados =
        categoria === "all"
            ? produtos
            : produtos.filter(
                function (produto) {

                    return produto.categories?.some(
                        function (cat) {

                            return cat.handle === categoria;

                        }
                    );

                }
            );


    if (produtosFiltrados.length === 0) {

        productsContainer.innerHTML = `
            <p class="loading-products">
                NENHUM PRODUTO NESSA CATEGORIA.
            </p>
        `;

        return;

    }


    produtosFiltrados.forEach(
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
   CATEGORIAS
========================= */

const botoesCategorias =
    document.querySelectorAll(
        ".categories button"
    );


botoesCategorias.forEach(
    function (botao) {

        botao.addEventListener(
            "click",
            function () {

                const categoria =
                    botao.dataset.category;


                mostrarProdutos(
                    categoria
                );

            }
        );

    }
);


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


    /* =========================
       IR PARA CHECKOUT
    ========================= */

    const checkoutButton =
        document.querySelector(
            "#checkout-button"
        );


    if (checkoutButton) {

        checkoutButton.addEventListener(
            "click",
            function () {

                localStorage.setItem(
                    "flowerCarrinho",
                    JSON.stringify(carrinho)
                );


                window.location.href =
                    "./checkout.html";

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


/* =========================
   VERIFICAR LOGIN
========================= */

verificarUsuario();


/* =========================
   CARREGAR PRODUTOS
========================= */

carregarProdutos();


/* =========================
   CARREGAR BANNERS
========================= */

console.log(
    "Iniciando carregamento dos banners..."
);


carregarBanners();