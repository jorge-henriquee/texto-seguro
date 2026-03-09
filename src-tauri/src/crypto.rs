use aes_gcm::{
    aead::{Aead, KeyInit, OsRng},
    Aes256Gcm, Nonce,
};
use argon2::{
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use base64::{engine::general_purpose, Engine};
use rand::RngCore;

const SALT_GLOBAL: &[u8] = b"vsVmcuyHheXXIhYJ";

/// gera chave AES baseada na senha
pub fn derive_key(password: &str) -> [u8; 32] {
    let mut key = [0u8; 32];

    Argon2::default()
        .hash_password_into(password.as_bytes(), SALT_GLOBAL, &mut key)
        .expect("Erro ao derivar chave");

    key
}

/// criptografar texto
pub fn encrypt(key: &[u8], data: &str) -> Result<String, String> {
    let cipher = Aes256Gcm::new_from_slice(key).map_err(|_| "Erro ao criar cipher")?;

    let mut nonce_bytes = [0u8; 12];
    OsRng.fill_bytes(&mut nonce_bytes);

    let nonce = Nonce::from_slice(&nonce_bytes);

    let encrypted = cipher
        .encrypt(nonce, data.as_bytes())
        .map_err(|_| "Erro ao criptografar")?;

    let mut result = nonce_bytes.to_vec();
    result.extend_from_slice(&encrypted);

    Ok(general_purpose::STANDARD.encode(result))
}

/// descriptografar texto
pub fn decrypt(key: &[u8], encrypted: &str) -> Result<String, String> {
    let decoded = general_purpose::STANDARD
        .decode(encrypted)
        .map_err(|_| "Base64 inválido")?;

    if decoded.len() < 12 {
        return Err("Dados corrompidos".into());
    }

    let (nonce_bytes, cipher_text) = decoded.split_at(12);

    let cipher = Aes256Gcm::new_from_slice(key).map_err(|_| "Erro ao criar cipher")?;

    let decrypted = cipher
        .decrypt(Nonce::from_slice(nonce_bytes), cipher_text)
        .map_err(|_| "Senha incorreta ou dados adulterados")?;

    String::from_utf8(decrypted).map_err(|_| "Erro interno de decodificação".into())
}

pub fn criptografar_senha(senha: &str) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);

    let hash = Argon2::default()
        .hash_password(senha.as_bytes(), &salt)
        .map_err(|e| e.to_string())?
        .to_string();

    Ok(hash)
}
pub fn verificar_senha(senha_digitada: &str, hash_banco: &str) -> bool {
    let parsed_hash = match PasswordHash::new(hash_banco) {
        Ok(h) => h,
        Err(_) => return false,
    };

    Argon2::default()
        .verify_password(senha_digitada.as_bytes(), &parsed_hash)
        .is_ok()
}
