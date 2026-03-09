# Texto Seguro

<img width="1536" height="1024" alt="logo_2" src="https://github.com/user-attachments/assets/54c85738-4576-4c75-b8f3-ad6d0b4dadc7" />


**Texto Seguro** é um aplicativo desktop para Windows feito com Tauri e Rust.  
> ⚠️ Este projeto foi criado enquanto eu estava aprendendo a desenvolver apps desktop.  
> Está disponível aqui para que outros possam ver o que eu construí e acompanhar meu aprendizado.

O app explora conceitos de criação de apps desktop modernos, otimização de binário e integração com Rust + Tauri.

---

## 🚀 Funcionalidades

- Interface moderna e minimalista
- Criptografia e armazenamento de textos
- Atualizações automáticas (quando configuradas)
- Compilado para Windows (.exe) otimizado e leve

---

## 💾 Instalação

1. Acesse os [Releases do GitHub](https://github.com/seuusuario/texto-seguro/releases).  
2. Baixe o arquivo `.exe` ou instalador `.msi`.  
3. Execute e siga o assistente de instalação.

---

## 🛠️ Build / Compilação (para estudo)

Se quiser compilar o projeto você mesmo:

```bash
# Instale dependências
npm install

# Build do front-end
npm run build

# Build do Tauri para Windows
npm run tauri build
