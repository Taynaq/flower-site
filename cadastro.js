// =========================
// CONFIGURAÇÃO DO SUPABASE
// =========================

const SUPABASE_URL = "https://awnswqbjspexvroatkyk.supabase.co";
const SUPABASE_KEY = "sb_publishable_23V70RTA0STgz3bT0_uuDA_-TE8E7nt";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =========================
// FORMULÁRIO DE CADASTRO
// =========================

const cadastroForm = document.querySelector("#cadastro-form");

cadastroForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const nome = document.querySelector("#nome").value.trim();
    const email = document.querySelector("#email").value.trim();
    const senha = document.querySelector("#senha").value;
    const confirmarSenha =
        document.querySelector("#confirmar-senha").value;


    // =========================
    // VERIFICAR SENHAS
    // =========================

    if (senha !== confirmarSenha) {
        alert("As senhas não são iguais.");
        return;
    }


    // =========================
    // VERIFICAR TAMANHO DA SENHA
    // =========================

    if (senha.length < 8) {
        alert("A senha precisa ter pelo menos 8 caracteres.");
        return;
    }


    // =========================
    // CRIAR USUÁRIO NO SUPABASE
    // =========================

    const { data, error } =
       await supabaseClient.auth.signUp({
    email: email,
    password: senha,
    options: {
        emailRedirectTo: "http://127.0.0.1:5500/",
        data: {
            nome: nome
        }
    }
});

    // =========================
    // VERIFICAR ERRO
    // =========================

    if (error) {
        console.error("Erro no cadastro:", error);

        alert(
            "Não foi possível criar a conta: " +
            error.message
        );

        return;
    }


    // =========================
    // CADASTRO REALIZADO
    // =========================

    console.log("Usuário criado:", data);

    alert(
        "Conta criada com sucesso!"
    );

    cadastroForm.reset();

});