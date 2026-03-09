function createModal({ id = "", content = "", onClose = null, sizeClass = "bg-white rounded-2xl shadow-xl max-w-md w-full" }) {
    // Criar overlay com fundo preto semi-transparente
    const overlay = document.createElement("div");
    overlay.setAttribute("id", id);
    overlay.className = "fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 z-50 m-4 ";

    // Criar modal container
    const modal = document.createElement("div");
    modal.className = `${sizeClass} translet`;


    // Conteúdo
    const body = document.createElement("div");
    body.innerHTML = content;

    // Montagem
    modal.appendChild(body);
    overlay.appendChild(modal);
    document.querySelector("#body-content").appendChild(overlay);
    document.body.setAttribute("data-scroll-locked", "");

    // Função de fechar
    function close() {
        overlay.remove();
        document.body.removeAttribute("data-scroll-locked");
        if (typeof onClose === "function") onClose();
    }


    overlay.addEventListener("click", (e) => {
        if (e.target === overlay) close();
    });
    return { close, overlay, modal, body };
}
function closeModal(id) {
    var modal = document.getElementById(id);
    document.body.removeAttribute("data-scroll-locked");
    if (modal) modal.remove();
}
function LoadingOpen(texto) {
    return new Promise((resolve) => {
        var body = document.querySelector("#body-content");
        var load = document.createElement("div");
        load.classList.add("loading");
        load.setAttribute("id", "loadingText");

        var loarder = document.createElement("div");
        loarder.classList.add("loader");

        var spanLoader = document.createElement("span");
        spanLoader.setAttribute("id", "loadingSpan");
        spanLoader.classList.add("Texto");
        spanLoader.innerHTML = texto;

        load.appendChild(spanLoader);
        load.appendChild(loarder);
        body.appendChild(load);
        resolve();
    });
}
function showAlert(message, type = "success", autoClose = true, duration = 3000) {
    return new Promise((resolve) => {
        var body = document.querySelector("#body-content");
        var alertBox = document.createElement("div");
        alertBox.classList.add("custom-alert", `alert-${type}`);

        var spanMessage = document.createElement("span");
        spanMessage.classList.add("alert-text");
        spanMessage.innerHTML = message;

        // Botão OK
        var okBtn = document.createElement("button");
        okBtn.classList.add("alert-ok");
        okBtn.innerHTML = "OK";

        okBtn.onclick = function () {
            alertBox.classList.add("fadeOut");
            setTimeout(() => {
                alertBox.remove();
                resolve();
            }, 300);
        };

        alertBox.appendChild(spanMessage);
        alertBox.appendChild(okBtn);
        body.appendChild(alertBox);

        // Auto fechar se ativado
        if (autoClose) {
            setTimeout(() => {
                if (document.body.contains(alertBox)) {
                    alertBox.classList.add("fadeOut");
                    setTimeout(() => {
                        alertBox.remove();
                        resolve();
                    }, 300);
                }
            }, duration);
        }
    });
}
function LoadingClose() {
    return new Promise((resolve) => {
        var load = document.querySelector("#loadingText");
        if (load != null || load != undefined) {
            load.remove();
        }
        resolve();
    });
}
function tema_sidebar() {
    const btnTema = document.getElementById("btn_tema");
    const iconTema = document.getElementById("icon_tema");

    const html = document.documentElement;



    const iconMoon = `
<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
`;

    const iconSun = `
<circle cx="12" cy="12" r="4"></circle>
<path d="M12 2v2"></path>
<path d="M12 20v2"></path>
<path d="m4.93 4.93 1.41 1.41"></path>
<path d="m17.66 17.66 1.41 1.41"></path>
<path d="M2 12h2"></path>
<path d="M20 12h2"></path>
<path d="m6.34 17.66-1.41 1.41"></path>
<path d="m19.07 4.93-1.41 1.41"></path>
`;

    function aplicarTema(tema) {

        if (tema === "dark") {

            html.classList.add("dark");
            localStorage.setItem("tema", "dark");

            iconTema.innerHTML = iconSun;

        } else {

            html.classList.remove("dark");
            localStorage.setItem("tema", "light");

            iconTema.innerHTML = iconMoon;
        }
    }

    // carregar tema
    const temaSalvo = localStorage.getItem("tema") || "light";
    aplicarTema(temaSalvo);

    // clique
    btnTema.onclick = () => {
        const darkAtivo = html.classList.contains("dark");
        aplicarTema(darkAtivo ? "light" : "dark");
        window.location.reload();
    };
}
function gerarSenhaSegura(tamanho = 16) {

    const minusculas = "abcdefghijklmnopqrstuvwxyz";
    const maiusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numeros = "0123456789";
    const simbolos = "!@#$%&*_-+=?";

    const caracteres =
        minusculas +
        maiusculas +
        numeros +
        simbolos;

    let senha = "";

    const array = new Uint32Array(tamanho);
    crypto.getRandomValues(array);

    for (let i = 0; i < tamanho; i++) {
        senha += caracteres[array[i] % caracteres.length];
    }

    return senha;
}
function visualizar_senha(input) {
    if (!input) return;
    if (input.type == "password") {
        input.type = "texto";
    } else {
        input.type = "password";
    }
}
export const funcoes = Object.freeze({
    tema_sidebar,
    createModal,
    closeModal,
    LoadingOpen,
    showAlert,
    LoadingClose,
    gerarSenhaSegura,
    visualizar_senha
})