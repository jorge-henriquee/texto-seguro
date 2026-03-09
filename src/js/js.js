const { invoke } = window.__TAURI__.core;
import { funcoes } from './funcoes.js';

let paginaAtual = 1;
let itensPorPagina = 0;
let totalRegistros = 0;


document.addEventListener("DOMContentLoaded", async () => {
    try {
        await invoke("validar_sessao_logado");
    } catch (e) {
        console.log(e);
        await invoke("logout");
        window.location.href = "index.html";
    }
    funcoes.tema_sidebar();
    adicionar();
    filtro_categorias();
    await listar_textos();
    document.querySelector("#filtro").onchange = async () => {
        paginaAtual = 1;
        await listar_textos();
    }
})


function adicionar() {
    document.querySelector("#btn_adicionar").onclick = async () => {
        funcoes.createModal({
            id: 'modal_adicionar',
            content: `
          <div class="flex flex-col space-y-1.5 text-center sm:text-left">
    <h2 class="tracking-tight text-xl font-bold text-gray-900 dark:text-white">Nova Entrada</h2>
</div>
<div class="space-y-5 py-2" id="form_adicionar">
    <div class="space-y-2">
        <label class="text-sm font-medium text-gray-700 dark:text-gray-300">
            Categoria
        </label>

        <select name="categoria" required="s"
            class="flex w-full items-center justify-between border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 h-11 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <option value="nota">📝 Notas</option>
            <option value="email">📧 Email</option>
            <option value="link">🔗 Link</option>
            <option value="senha">🔐 Senhas</option>
            <option value="outros">📂 Outros</option>

        </select>
    </div>
    <div class="space-y-2"><label
            class="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-300">Título
            *</label><input  name="titulo" required="s"
            class="flex w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-11 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="Ex: Gmail, Netflix, Banco..." value=""></div>
                <div id="tipo_categoria">
                </div>
    <div class="space-y-2"><label
            class="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-300">Usuário
            / Email associado</label><input  name="email_associado"
            class="flex w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-11 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="nome@email.com" value=""></div>
    <div class="space-y-2"><label
            class="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-300">URL
            / Site</label><input  name="url_site"
            class="flex w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-11 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="https://..." value=""></div>
    <div class="space-y-2"><label
            class="peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-sm font-medium text-gray-700 dark:text-gray-300">Observações</label><textarea  name="observacao"
            class="flex w-full border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-xl min-h-[80px] resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="Anotações extras..."></textarea></div>
</div>
<div class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 gap-2">
    <button id="btn_salvar_modal" class="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium 
        transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring 
        disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4
         [&amp;_svg]:shrink-0 shadow hover:bg-primary/90 h-9 px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-600 
         hover:from-emerald-600 hover:to-green-700 rounded-xl text-white">Salvar</button>
</div>
          `,
            sizeClass: `fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg sm:max-w-lg max-h-[90vh] overflow-y-auto dark:bg-gray-900 dark:border-gray-800`
        })
        salvar_texto();
        tipo_categoria();
    }
}

async function salvar_texto() {
    document.querySelector("#btn_salvar_modal").onclick = async () => {
        var inputs = document.querySelectorAll("#form_adicionar input, #form_adicionar select, #form_adicionar textarea");
        let dados = {};
        let err = 0;

        for (const inpt of inputs) {

            const name = inpt.getAttribute("name");
            const value = inpt.value;

            if (inpt.getAttribute("required") === 's' && value === "") {
                err++;
                break;
            }

            dados[name] = value || null;
        }

        if (err > 0) {
            funcoes.showAlert('Preencha as informações com *', "warning");
            return;
        }

        try {
            const encrypted = await invoke("criptografar_texto", {
                texto: dados.conteudo
            });
            var resultado_criptografia = JSON.parse(encrypted);
            if (resultado_criptografia.success == true) {
                var resultado = await invoke("inserir_texto", {
                    categoria: dados.categoria,
                    titulo: dados.titulo,
                    conteudo: resultado_criptografia.dados,
                    emailAssociado: dados.email_associado || "",
                    urlSite: dados.url_site || "",
                    observacao: dados.observacao || ""
                });
                var resultado_insercao = JSON.parse(resultado);
                if (resultado_insercao.success == true) {
                    funcoes.showAlert("Cadastrado com sucesso.", "success");
                    funcoes.closeModal('modal_adicionar');
                    await listar_textos();
                } else {
                    funcoes.showAlert(resultado_insercao || "Algo deu errado ao inserir os dados.", "error");
                }
            } else {
                funcoes.showAlert(resultado_criptografia || "Erro na Criptografia dos dados.", "error");
            }

        } catch (error) {
            console.log(error);
            funcoes.showAlert(error || "Algo deu errado", "error");
        }
    }
}

function tipo_categoria() {
    var select = document.querySelector("#form_adicionar select[name='categoria']");
    let valor = select.value;
    var div = document.querySelector("#form_adicionar #tipo_categoria");
    switch (valor) {
        case 'email':
            div.innerHTML = `
                <div class="space-y-2"><label
                
                        class="text-sm font-medium text-gray-700 dark:text-gray-300">Email
                        *</label>
                    <div class="relative"><input type="text" name="conteudo" required="s"
                            class="flex w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-11 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
                            placeholder="email@exemplo.com" value="">
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"></div>
                    </div>
                </div>
                `
            break;
        case 'senha':
            div.innerHTML = `
                <div class="space-y-2"><label
                        class="text-sm font-medium text-gray-700 dark:text-gray-300">Senha
                        *</label>
                    <div class="relative"><input type="password" name="conteudo" id="senha" required="s"
                            class="flex w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-11 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
                            placeholder="Sua senha" value="">
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"><button id="btn_mostrar_senha"
                                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7"
                                type="button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-eye-off w-3.5 h-3.5">
                                    <path
                                        d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49">
                                    </path>
                                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                                    <path
                                        d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143">
                                    </path>
                                    <path d="m2 2 20 20"></path>
                                </svg></button><button id="btn_gerar_senhas_aleatorias"
                                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7"
                                type="button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-shuffle w-3.5 h-3.5">
                                    <path d="m18 14 4 4-4 4"></path>
                                    <path d="m18 2 4 4-4 4"></path>
                                    <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"></path>
                                    <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"></path>
                                    <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"></path>
                                </svg></button>
                                </div>
                    </div>
                </div>
                `
            break;
        case 'link':
            div.innerHTML = `
              <div class="space-y-2"><label
                        class="text-sm font-medium text-gray-700 dark:text-gray-300">Link
                        *</label>
                    <div class="relative"><input type="text" name="conteudo" required="s"
                            class="flex w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-11 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
                            placeholder="https://..." value="">
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"></div>
                    </div>
                </div>
                `
            break;
        case 'nota':
            div.innerHTML = `
                <div class="space-y-2"><label
                        class="text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo
                        *</label>
                    <div class="relative"><textarea  name="conteudo" required="s"
            class="flex w-full border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-xl min-h-[80px] resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="Anotações extras..."></textarea>
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"></div>
                    </div>
                </div>
                `
            break;
        case 'outros':
            div.innerHTML = `
               <div class="space-y-2"><label
                        class="text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo
                        *</label>
                    <div class="relative"><textarea  name="conteudo" required="s"
            class="flex w-full border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-xl min-h-[80px] resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="Anotações extras..."></textarea>
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"></div>
                    </div>
                </div>
                `
            break;
    }

    var mostrar_senha = document.querySelector("#btn_mostrar_senha")
    if (mostrar_senha) {
        mostrar_senha.onclick = () => {
            const input = document.querySelector("#form_adicionar #senha")

            if (!input) return;
            input.type =
                input.type === "password"
                    ? "text"
                    : "password";
        }
    }

    var gerar_senhas = document.querySelector("#btn_gerar_senhas_aleatorias")
    if (gerar_senhas) {
        gerar_senhas.onclick = () => {
            const input = document.querySelector("#form_adicionar #senha")

            if (!input) return;
            input.value = funcoes.gerarSenhaSegura(16);

        }
    }
    document.querySelector("#form_adicionar select[name='categoria']").onchange = (e) => {
        let valor = e.target.value;
        var div = document.querySelector("#form_adicionar #tipo_categoria");
        switch (valor) {
            case 'email':
                div.innerHTML = `
                <div class="space-y-2"><label
                
                        class="text-sm font-medium text-gray-700 dark:text-gray-300">Email
                        *</label>
                    <div class="relative"><input type="text" name="conteudo" required="s"
                            class="flex w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-11 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
                            placeholder="email@exemplo.com" value="">
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"></div>
                    </div>
                </div>
                `
                break;
            case 'senha':
                div.innerHTML = `
                <div class="space-y-2"><label
                        class="text-sm font-medium text-gray-700 dark:text-gray-300">Senha
                        *</label>
                    <div class="relative"><input type="password" name="conteudo" id="senha" required="s"
                            class="flex w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-11 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
                            placeholder="Sua senha" value="">
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"><button id="btn_mostrar_senha"
                                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7"
                                type="button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-eye-off w-3.5 h-3.5">
                                    <path
                                        d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49">
                                    </path>
                                    <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242"></path>
                                    <path
                                        d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143">
                                    </path>
                                    <path d="m2 2 20 20"></path>
                                </svg></button><button id="btn_gerar_senhas_aleatorias"
                                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent hover:text-accent-foreground h-7 w-7"
                                type="button"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                    fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                    class="lucide lucide-shuffle w-3.5 h-3.5">
                                    <path d="m18 14 4 4-4 4"></path>
                                    <path d="m18 2 4 4-4 4"></path>
                                    <path d="M2 18h1.973a4 4 0 0 0 3.3-1.7l5.454-8.6a4 4 0 0 1 3.3-1.7H22"></path>
                                    <path d="M2 6h1.972a4 4 0 0 1 3.6 2.2"></path>
                                    <path d="M22 18h-6.041a4 4 0 0 1-3.3-1.8l-.359-.45"></path>
                                </svg></button>
                                </div>
                    </div>
                </div>
                `
                break;
            case 'link':
                div.innerHTML = `
              <div class="space-y-2"><label
                        class="text-sm font-medium text-gray-700 dark:text-gray-300">Link
                        *</label>
                    <div class="relative"><input type="text" name="conteudo" required="s"
                            class="flex w-full border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm h-11 rounded-xl dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
                            placeholder="https://..." value="">
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"></div>
                    </div>
                </div>
                `
                break;
            case 'nota':
                div.innerHTML = `
                <div class="space-y-2"><label
                        class="text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo
                        *</label>
                    <div class="relative"><textarea  name="conteudo" required="s"
            class="flex w-full border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-xl min-h-[80px] resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="Anotações extras..."></textarea>
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"></div>
                    </div>
                </div>
                `
                break;
            case 'outros':
                div.innerHTML = `
               <div class="space-y-2"><label
                        class="text-sm font-medium text-gray-700 dark:text-gray-300">Conteúdo
                        *</label>
                    <div class="relative"><textarea  name="conteudo" required="s"
            class="flex w-full border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm rounded-xl min-h-[80px] resize-none dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500"
            placeholder="Anotações extras..."></textarea>
                        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1"></div>
                    </div>
                </div>
                `
                break;
        }

        var mostrar_senha = document.querySelector("#btn_mostrar_senha")
        if (mostrar_senha) {
            mostrar_senha.onclick = () => {
                const input = document.querySelector("#form_adicionar #senha")

                if (!input) return;
                input.type =
                    input.type === "password"
                        ? "text"
                        : "password";
            }
        }

        var gerar_senhas = document.querySelector("#btn_gerar_senhas_aleatorias")
        if (gerar_senhas) {
            gerar_senhas.onclick = () => {
                const input = document.querySelector("#form_adicionar #senha")

                if (!input) return;
                input.value = funcoes.gerarSenhaSegura(16);

            }
        }
    }
}


async function listar_textos() {
    try {
        funcoes.LoadingOpen("Carregando...");
        var filtro = document.querySelector("#filtro").value || "";
        var body = document.querySelector("#lista_textos");
        var sem_registro = document.querySelector("#sem_registro");
        sem_registro.classList.add("hidden");
        body.classList.add("hidden");
        let categoria = document.querySelector("#form_btn_categorias button.active")?.getAttribute("value") || "";
        var resultado = await invoke("listar_texto_completo", { filtro: filtro, categoria: categoria, page: paginaAtual });
        var resultado_json = JSON.parse(resultado);

        if (resultado_json.success == true) {

            totalRegistros = resultado_json.dados.total;
            itensPorPagina = resultado_json.dados.limit;

            if (resultado_json.dados.length == 0) {
                sem_registro.classList.remove("hidden");
            } else {
                let tr = ``;
                for (let x of resultado_json.dados.itens) {
                    let svg_categoria = ``;
                    let svg_titulo = ``;
                    switch (x.categoria) {
                        case 'senha':
                            svg_titulo = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key-round w-5 h-5 text-emerald-600"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`
                            svg_categoria = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-key-round w-3 h-3 mr-1"><path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"></path><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>`
                            break;
                        case 'outros':
                            svg_titulo = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-5 h-5 text-emerald-600"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>`
                            svg_categoria = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-3 h-3 mr-1"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>`
                            break;
                        case 'nota':
                            svg_titulo = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-5 h-5 text-emerald-600"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>`
                            svg_categoria = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-file-text w-3 h-3 mr-1"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"></path><path d="M14 2v4a2 2 0 0 0 2 2h4"></path><path d="M10 9H8"></path><path d="M16 13H8"></path><path d="M16 17H8"></path></svg>`
                            break;
                        case 'email':
                            svg_titulo = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail w-5 h-5 text-emerald-600"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`
                            svg_categoria = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-mail w-3 h-3 mr-1"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>`
                            break;
                        case 'link':
                            svg_titulo = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2 w-5 h-5 text-emerald-600"><path d="M9 17H7A5 5 0 0 1 7 7h2"></path><path d="M15 7h2a5 5 0 1 1 0 10h-2"></path><line x1="8" x2="16" y1="12" y2="12"></line></svg>`
                            svg_categoria = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-link2 w-3 h-3 mr-1"><path d="M9 17H7A5 5 0 0 1 7 7h2"></path><path d="M15 7h2a5 5 0 1 1 0 10h-2"></path><line x1="8" x2="16" y1="12" y2="12"></line></svg>`
                            break;
                    }
                    tr += `
                            <div
                                class="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm
                                 hover:shadow-xl hover:border-emerald-100 dark:hover:border-emerald-800 transition-all duration-300
                                  overflow-hidden group relative">
                                <div class="p-5">
                                    <div class="flex items-start justify-between mb-3">
                                        <div class="flex items-center gap-3">
                                            <div
                                                    class="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center">
                                                ${svg_titulo}
                                            </div>
                                            <div>
                                            <h3 class="font-semibold text-gray-900 dark:text-white text-sm leading-tight">${x.titulo}</h3>
                                            <p class="text-xs text-gray-400 mt-0.5">${x.email_associado}</p>
                                            </div>
                                        </div>
                                        <div class="flex items-center gap-1">
                                            <button id="btn_favoritos" codigo="${x.id}" valor="${x.favorito}"
                                                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
                                                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none
                                                 disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent 
                                                 hover:text-accent-foreground h-8 w-8 group-hover:opacity-100 transition-opacity">
                                                 <svg
                                                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                    class="lucide lucide-star w-4 h-4 
                                                    ${x.favorito == 1 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-500'}
                                                    ">
                                                    <path
                                                    d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z">
                                                    </path>
                                                </svg>
                                                </button>
                                                <button id="btn_excluir" codigo="${x.id}"
                                                class="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium 
                                                focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none
                                                 disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:bg-accent 
                                                 hover:text-accent-foreground h-8 w-8 group-hover:opacity-100 
                                                  h-8 w-8 transition-opacity">
                                            <svg
                                                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                    class="lucide lucide-trash2 w-4 h-4 mr-2 hover:red text-gray-500">
                                                    <path d="M3 6h18"></path>
                                                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                                                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                                                    <line x1="10" x2="10" y1="11" y2="17"></line>
                                                    <line x1="14" x2="14" y1="11" y2="17"></line>
                                                </svg>

                                                </button>
                       
                                            
                                        </div>
                                    </div>
                                    <div
                                      class="bg-gradient-to-br from-gray-50 to-emerald-50/20 dark:bg-gray-800 dark:from-gray-800 dark:to-gray-800 rounded-xl px-4 py-3 flex items-center justify-between gap-2 mb-3 border border-gray-100 dark:border-gray-700 group-hover:border-emerald-100 dark:group-hover:border-emerald-800 transition-colors">
                                       <p id="camp_conteudo" class="${x.categoria == 'senha' ? 'text-pass' : ''} text-sm text-gray-700 dark:text-gray-300 truncate font-mono flex-1">${x.conteudo_descripty}</p>
                                        <div class="flex items-center gap-1 shrink-0">
                                            <button name="visualizar"
                                                class="class="${x.categoria != 'senha' ? 'hidden' : ''} btn-visualizar inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:text-accent-foreground h-7 w-7 hover:bg-white dark:hover:bg-gray-700"><svg
                                                    xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                    class="lucide lucide-eye w-3.5 h-3.5 text-gray-500">
                                                    <path
                                                    d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0">
                                                    </path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                                </button>
                                                <button name="copiar"
                                                    class="btn-copiar inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:text-accent-foreground h-7 w-7 hover:bg-white dark:hover:bg-gray-700"><svg
                                                        xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                                        class="lucide lucide-copy w-3.5 h-3.5 text-gray-500">
                                                        <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                                                        <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                                                    </svg>
                                                </button>
                                        </div>
                                    </div>
                                    <div class="flex items-center justify-between gap-2">
                                        <div
                                            class="inline-flex items-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 bg-emerald-50 text-emerald-700 border-emerald-200 border text-xs font-medium px-2.5 py-0.5">                                           
                                            ${svg_categoria}                               
                                            ${x.categoria}
                                        </div>
                                        <a href="#" id="link_site" link="${x.url_site}"
                                            class="${x.url_site == '' ? 'hidden' : ''} text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 transition-colors"><svg
                                            xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                                            class="lucide lucide-external-link w-3 h-3">
                                            <path d="M15 3h6v6"></path>
                                            <path d="M10 14 21 3"></path>
                                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                            </svg>
                                        </a>
                                    </div>
                                    <p class="text-xs text-gray-400 dark:text-gray-500 mt-2 line-clamp-2">${x.observacao}</p>
                                </div>
                                </div>
                        
                        `
                }

                body.classList.remove("hidden");
                body.innerHTML = tr;

                document.querySelectorAll('button[name="visualizar"]').forEach(btn => {
                    btn.addEventListener('click', visualizarConteudo);
                });

                document.querySelectorAll('button[name="copiar"]').forEach(btn => {
                    btn.addEventListener('click', copiarConteudo);
                });

                excluir_texto();
                favoritar_texto();
                renderPaginacao();
                acessar_link();
            }
        }
    } catch (error) {
        console.log(error);
        funcoes.showAlert(error || "Algo deu errado ao listar os registro da base de dados local.", "error");
    } finally {
        funcoes.LoadingClose();
    }
}
function visualizarConteudo(event) {
    const btn = event.currentTarget;
    const container = btn.closest('div').previousElementSibling; // pega o <p> anterior
    if (!container) return;

    // Remove a classe 'text-pass' para mostrar o conteúdo
    container.classList.toggle('text-pass');
}
function copiarConteudo(event) {
    const btn = event.currentTarget;
    const container = btn.closest('div').previousElementSibling; // pega o <p> anterior
    if (!container) return;

    const texto = container.textContent;
    if (!texto) return;

    // Copia para a área de transferência
    navigator.clipboard.writeText(texto)
        .then(() => {
            funcoes.showAlert("Copiado!");
        })
        .catch(err => console.error('Erro ao copiar: ', err));
}

function renderPaginacao() {

    const container = document.querySelector("#paginacao");

    const totalPaginas =
        Math.ceil(totalRegistros / itensPorPagina);

    let html = "";

    const btnBase = `btn-page
   inline-flex items-center 
    justify-center gap-2 whitespace-nowrap text-sm font-medium transition-colors
     focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 
     [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 border border-input bg-background shadow-sm hover:bg-accent
      hover:text-accent-foreground h-9 w-9 rounded-xl dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800
    `;

    const btnRangerBase = ` btn-page
    inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-colors
     focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none
      disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:bg-accent px-3 
    text-xs h-9 w-9 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800
    `

    const btnAtivo = ` btn-page
  inline-flex items-center justify-center gap-2 whitespace-nowrap 
  font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 
  focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none
   [&_svg]:size-4 [&_svg]:shrink-0 shadow hover:bg-primary/90 px-3 text-xs h-9 w-9 rounded-xl bg-gradient-to-r
    from-emerald-500 to-green-600 text-white hover:from-emerald-600 hover:to-green-700
    `;

    /* ================= PRIMEIRA ================= */

    html += `
    <button data-page="1"
    ${paginaAtual === 1 ? "disabled" : ""}
    class="${paginaAtual === 1 ? 'opacity-40 cursor-not-allowed' : ''} ${btnBase}
    ">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-first-icon lucide-chevron-first"><path d="m17 18-6-6 6-6"/><path d="M7 6v12"/></svg>
    </button>
    `;

    /* ================= PREV ================= */

    html += `
    <button data-page="${paginaAtual - 1}"
    ${paginaAtual === 1 ? "disabled" : ""}
    class="${paginaAtual === 1 ? 'opacity-40 cursor-not-allowed' : ''}
     ${btnBase}
    ">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left w-4 h-4"><path d="m15 18-6-6 6-6"></path></svg>
    </button>
    `;

    /* ================= RANGE ================= */

    let inicio = Math.max(1, paginaAtual - 2);
    let fim = Math.min(totalPaginas, paginaAtual + 2);
    let arr = "";

    for (let i = inicio; i <= fim; i++) {
        arr += `<button data-page="${i}" class="${i === paginaAtual ? btnAtivo : btnRangerBase}">
                ${i}
            </button>`;
    }

    html += `<div class="flex items-center gap-1">${arr}</div>`;


    /* ================= NEXT ================= */

    html += `
    <button data-page="${paginaAtual + 1}"
    ${paginaAtual === totalPaginas ? "disabled" : ""}
    class="${paginaAtual === totalPaginas ? 'opacity-40 cursor-not-allowed' : ''}
        ${btnBase}
    ">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right w-4 h-4"><path d="m9 18 6-6-6-6"></path></svg>
    </button>
    `;

    /* ================= ULTIMA ================= */

    html += `
    <button data-page="${totalPaginas}"
    ${paginaAtual === totalPaginas ? "disabled" : ""}
    class="${btnBase} ${paginaAtual === totalPaginas ? 'opacity-40 cursor-not-allowed' : ''}">
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-last-icon lucide-chevron-last"><path d="m7 18 6-6-6-6"/><path d="M17 6v12"/></svg>
    </button>
    `;

    container.innerHTML = html;

    container.onclick = async (e) => {

        const botao = e.target.closest(".btn-page");
        if (!botao || botao.disabled) return;

        const pagina = Number(botao.dataset.page);

        if (!pagina || pagina < 1 || pagina > totalPaginas) return;

        paginaAtual = pagina;

        await listar_textos();
    };
}

function excluir_texto() {
    var buttons = document.querySelectorAll("#lista_textos #btn_excluir");
    for (let btn of buttons) {
        btn.onclick = async () => {
            try {
                var codigo = btn.getAttribute("codigo");
                if (!codigo) return funcoes.showAlert("Código do registro não encontrado.", "error");
                if (Number(codigo) <= 0) return funcoes.showAlert("Código do registro inválido.", "error");

                if (confirm("Deseja realmente excluir esse registro?")) {

                    var resultado = await invoke("excluir_texto", { id: Number(codigo) });
                    var resultado_json = JSON.parse(resultado);
                    if (resultado_json.success == true) {
                        funcoes.showAlert("Registro excluído com sucesso!", "success");
                    } else {
                        funcoes.showAlert(resultado_json.message || "Algo deu errado ao excluir o registro.", "error");
                    }
                }

            } catch (error) {
                console.log(error);
                funcoes.showAlert(error || "Algo deu errado ao excluir o registro.", "error");
            } finally {
                await listar_textos();
            }
        }
    }
}
function favoritar_texto() {
    var buttons = document.querySelectorAll("#lista_textos #btn_favoritos");
    for (let btn of buttons) {
        btn.onclick = async () => {
            try {
                var codigo = btn.getAttribute("codigo");
                var favorito = btn.getAttribute("favorito");
                if (!codigo) return funcoes.showAlert("Código do registro não encontrado.", "error");
                if (Number(codigo) <= 0) return funcoes.showAlert("Código do registro inválido.", "error");


                var resultado = await invoke("atualizar_favorito", { id: Number(codigo), favorito: favorito === "true" ? false : true });
                var resultado_json = JSON.parse(resultado);
                if (resultado_json.success == true) {
                    funcoes.showAlert("Registro favoritado com sucesso!", "success");
                } else {
                    funcoes.showAlert(resultado_json.message || "Algo deu errado ao favoritar o registro.", "error");
                }

            } catch (error) {
                console.log(error);
                funcoes.showAlert(error || "Algo deu errado ao favoritar o registro.", "error");
            } finally {
                await listar_textos();
            }
        }
    }
}
function filtro_categorias() {
    var buttons = document.querySelectorAll("#form_btn_categorias button");
    for (let btn of buttons) {
        btn.onclick = async () => {
            document.querySelectorAll("#form_btn_categorias button.active").forEach(b => b.classList.remove("active"));
            document.querySelectorAll("#form_btn_categorias button").forEach(b => b.classList.remove("bg-emerald-50",
                "dark:bg-emerald-900/50",
                "text-emerald-700",
                "dark:text-emerald-400",
                "border",
                "border-emerald-200",
                "dark:border-emerald-700"));
            document.querySelectorAll("#form_btn_categorias button").forEach(b => b.classList.add("text-gray-500", "dark:text-gray-400", "hover:text-gray-700", "dark:hover:text-gray-200", "hover:bg-gray-50", "dark:hover:bg-gray-800"));
            btn.classList.add("active");
            btn.classList.remove("text-gray-500", "dark:text-gray-400", "hover:text-gray-700", "dark:hover:text-gray-200", "hover:bg-gray-50", "dark:hover:bg-gray-800");
            btn.classList.add(
                "bg-emerald-50",
                "dark:bg-emerald-900/50",
                "text-emerald-700",
                "dark:text-emerald-400",
                "border",
                "border-emerald-200",
                "dark:border-emerald-700"
            );
            paginaAtual = 1;
            await listar_textos();
        }
    }
}
function acessar_link() {
    var buttons = document.querySelectorAll("#lista_textos #link_site");
    for (let btn of buttons) {
        btn.onclick = async () => {
            var link = btn.getAttribute("link");
            if (!link) return funcoes.showAlert("Código do registro não encontrado.", "error");
            const { shell } = window.__TAURI__ || {};
            if (!shell) return funcoes.showAlert("Shell do Tauri não disponível!", "error");

            shell.open(link)
                .then(() => funcoes.showAlert("URL aberta com sucesso!", "success"))
                .catch(() => funcoes.showAlert("Erro ao abrir URL!", "error"));

        }
    }
}