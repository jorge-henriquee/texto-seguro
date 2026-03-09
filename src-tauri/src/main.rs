// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
use tauri::Manager;
use tauri_plugin_single_instance::init;
mod comandos;
mod crypto;
mod offline;
mod online;
use std::sync::Mutex;
// Armazenar a senha derive key para descriptografar os dados sensiveis.

pub struct CryptoKey {
    pub key: Mutex<Option<[u8; 32]>>,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            offline::init_db(&app.handle())
                .expect("Algo deu errado na criação do banco de dados local.");
            app.manage(CryptoKey {
                key: Mutex::new(None),
            });
            Ok(())
        })
        //plugin do HTTp
        .plugin(tauri_plugin_http::init())
        //Evitar Duplicar o Page
        .plugin(init(|app, _, _| {
            let window = app.get_webview_window("main").unwrap();
            window.set_focus().unwrap();
        }))
        .invoke_handler(tauri::generate_handler![
            comandos::criptografar_texto,
            comandos::descriptografar_texto,
            offline::inserir_texto,
            offline::listar_texto_completo,
            offline::cadastrar_usuario,
            offline::consultar_login,
            comandos::validar_sessao_logado,
            offline::consultar_cadastro_login,
            offline::excluir_texto,
            offline::atualizar_favorito,
            comandos::limpar_chave,
        ])
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                let state: tauri::State<CryptoKey> = window.state();

                if let Ok(mut guard) = state.key.lock() {
                    *guard = None;
                };
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application")
}
