use crate::crypto;
use crate::CryptoKey;
use serde::Serialize;
#[tauri::command]
pub fn criptografar_texto(texto: String, state: tauri::State<CryptoKey>) -> Result<String, String> {
    let guard = state.key.lock().unwrap();
    let key = guard.as_ref().ok_or("Usuário não autenticado")?;
    let resultado = crypto::encrypt(key, &texto)?;
    Ok(format_retorno_json(true, "Criptografado", resultado))
}
#[tauri::command]
pub fn descriptografar_texto(
    texto: String,
    state: tauri::State<CryptoKey>,
) -> Result<String, String> {
    let guard = state.key.lock().unwrap();
    let key = guard.as_ref().ok_or("Usuário não autenticado")?;
    let resultado = crypto::decrypt(key, &texto)?;
    Ok(format_retorno_json(true, "Descriptografado", resultado))
}

pub fn format_retorno_json<T: Serialize>(success: bool, msg: &str, retorno: T) -> String {
    serde_json::json!({
        "success": success,
        "msg": msg,
        "dados": retorno
    })
    .to_string()
}
#[tauri::command]
pub fn validar_sessao_logado(state: tauri::State<CryptoKey>) -> Result<String, String> {
    let guard = state.key.lock().unwrap();
    let _key = guard.as_ref().ok_or("Usuário não autenticado")?;
    Ok("Bem vindo ao sistema.".into())
}

#[tauri::command]
pub fn limpar_chave(state: tauri::State<CryptoKey>) -> Result<(), String> {
    let mut guard = state.key.lock().map_err(|_| "Erro ao acessar chave")?;
    *guard = None;
    Ok(())
}
