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
// FORMULÁRIO DE LOGIN
// =========================

const loginForm = document.querySelector("#login-form");

loginForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const email =
        document.querySelector("#email").value.trim();

    const senha =
        document.querySelector("#senha").value;


    // =========================
    // LOGIN NO SUPABASE
    // =========================

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: senha
        });


    // =========================
    // VERIFICAR ERRO
    // =========================

    if (error) {

        console.error("Erro no login:", error);

        alert(
            "Não foi possível entrar: " +
            error.message
        );

        return;
    }


    // =========================
    // LOGIN REALIZADO
    // =========================

    console.log("Login realizado:", data);

    alert("Login realizado com sucesso!");

    window.location.href = "./index.html";

});