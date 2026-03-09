const { invoke } = window.__TAURI__.core;
import { funcoes } from './funcoes.js';

document.addEventListener("DOMContentLoaded", async () => {
    const telaLogin = document.querySelector('[tabindex="1"]');
    const telaCadastro = document.querySelector('[tabindex="2"]');
    var div_criar = document.querySelector("#div_criar_conta");
    try {
        const resp = await invoke("consultar_cadastro_login");
        const dados = JSON.parse(resp);

        if (dados.msg === "SEM_USUARIO") {
            telaLogin.classList.add("hidden");
            telaCadastro.classList.remove("hidden");
            criar_conta();
        } else {
            div_criar.classList.add("hidden");
        }
    } catch (error) {
        telaLogin.classList.add("hidden");
        telaCadastro.classList.remove("hidden");
    }

    entrar();

    document.getElementById("btn_criar_conta").onclick = () => {
        telaLogin.classList.add("hidden");
        telaCadastro.classList.remove("hidden");
    };

    document.getElementById("btn_voltar").onclick = () => {
        telaCadastro.classList.add("hidden");
        telaLogin.classList.remove("hidden");
    };

    document.getElementById("visu_confirm_senha").onclick = () => {
        funcoes.visualizar_senha(document.querySelector("#form_conta_login [name='confirmar_senha']"));
    }
    document.getElementById("visu_senha").onclick = () => {
        funcoes.visualizar_senha(document.querySelector("#form_conta_login [name='senha']"));
    }
    document.getElementById("visu_senha_login").onclick = () => {
        funcoes.visualizar_senha(document.querySelector("#senha_login"));
    }
})

function entrar() {
    document.querySelector("#btn_entrar").onclick = async () => {
        var email = document.querySelector("#email_login").value;
        var senha = document.querySelector("#senha_login").value;

        if (!email || !senha) return funcoes.showAlert("Preencha o email e a senha para proceguir...", "error");

        try {
            funcoes.LoadingOpen("Logando...");
            var resultado = await invoke("consultar_login", {
                email: email,
                senha: senha,
            });
            var resultado_insercao = JSON.parse(resultado);
            if (resultado_insercao.success == true) {
                window.location.href = "home.html";
            } else {
                funcoes.showAlert(resultado_insercao || "Algo deu errado ao logar", "error");
            }
        } catch (error) {
            console.log(error);
            funcoes.showAlert(error || "Algo deu errado", "error");
        } finally {
            funcoes.LoadingClose();
        }
    }

    document.querySelector("#senha_login").onchange = async () => {
        var email = document.querySelector("#email_login").value;
        var senha = document.querySelector("#senha_login").value;

        if (!email || !senha) return funcoes.showAlert("Preencha o email e a senha para proceguir...", "error");

        try {
            funcoes.LoadingOpen("Logando...");
            var resultado = await invoke("consultar_login", {
                email: email,
                senha: senha,
            });
            var resultado_insercao = JSON.parse(resultado);
            if (resultado_insercao.success == true) {
                window.location.href = "home.html";
            } else {
                funcoes.showAlert(resultado_insercao || "Algo deu errado ao logar", "error");
            }
        } catch (error) {
            console.log(error);
            funcoes.showAlert(error || "Algo deu errado", "error");
        } finally {
            funcoes.LoadingClose();
        }
    }
}

function criar_conta() {
    document.querySelector("#btn_salvar_criar_conta").onclick = async () => {
        var inputs = document.querySelectorAll("#form_conta_login input");
        let erro = 0;
        let dados = {};
        for (let input of inputs) {
            var nome = input.getAttribute("name");
            var valor = input.value;
            var requeri = input.getAttribute("required");
            if (requeri == 'S') {
                if (valor == '') {
                    ++erro;
                    break;
                }
            }
            dados[nome] = valor || null;
        }

        if (erro > 0) {
            funcoes.showAlert('Preencha as informações com *', "warning");
            return;
        }

        if (dados.senha != dados.confirmar_senha) {
            funcoes.showAlert('Senhas não batem.', "warning");
            return;
        }

        try {
            funcoes.LoadingOpen("Criando Usuario...");
            var resultado = await invoke("cadastrar_usuario", {
                usuario: dados.nome,
                senha: dados.senha,
                email: dados.email || ""
            });
            var resultado_insercao = JSON.parse(resultado);
            if (resultado_insercao.success == true) {
                funcoes.showAlert("Cadastrado com sucesso.", "success");
                setInterval(() => {
                    window.location.reload();
                }, 800);
            } else {
                funcoes.showAlert(resultado_insercao || "Algo deu errado ao inserir os dados.", "error");
            }
        } catch (error) {
            console.log(error);
            funcoes.showAlert(error || "Algo deu errado", "error");
        } finally {
            funcoes.LoadingClose();
        }
    }

}

