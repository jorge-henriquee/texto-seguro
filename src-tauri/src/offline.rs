use crate::comandos;
use crate::crypto;
use crate::CryptoKey;
use rusqlite::{params, Connection, Result};
use serde_json::json;
use std::sync::{Arc, Mutex, OnceLock};
use tauri::Manager;
pub const DB_NAME: &str = "textoseguro.db";

// Cria um Struct com MUtex para Armazenar Conexão com Banco de dados sem precisar refazer.
pub struct Database {
    pub conn: Arc<Mutex<Connection>>,
}
//Cria um instancia statica para poder armazenar o a conexão com mutex.
pub static DB_INSTACE: OnceLock<Database> = OnceLock::new();

pub fn init_db(app: &tauri::AppHandle) -> Result<()> {
    // pega diretório local do app
    let dir = app.path().app_local_data_dir().unwrap();

    // cria pasta se não existir
    std::fs::create_dir_all(&dir).unwrap();

    // define caminho do banco
    let db_path = dir.join(DB_NAME);
    let conn = Connection::open(db_path)?;
    create_tables(&conn).expect("Algo deu errado ao criar as tabelas");

    //Aqui ele inseri
    let db = Database {
        conn: Arc::new(Mutex::new(conn)),
    };
    //Aqui ele Inserir o Mutex com a conexão com banco
    DB_INSTACE.set(db).ok();

    Ok(())
}

pub fn create_tables(conn: &Connection) -> Result<()> {
    conn.execute(
        "
    CREATE TABLE IF NOT EXISTS textos (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        categoria VARCHAR(100) NOT NULL, 
        titulo TEXT NOT NULL,
        conteudo BLOB NOT NULL, 
        email_associado TEXT, 
        url_site TEXT, 
        observacao TEXT, 
        favorito BOOLEAN DEFAULT FALSE, 
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
      ",
        [],
    )?;
    conn.execute(
        "
      CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        usuario TEXT NOT NULL,
        email TEXT NOT NULL, 
        senha TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
      ",
        [],
    )?;
    Ok(())
}

#[tauri::command]
pub fn inserir_texto(
    categoria: &str,
    titulo: &str,
    conteudo: &str,
    email_associado: &str,
    url_site: &str,
    observacao: &str,
) -> Result<String, String> {
    let db = DB_INSTACE.get().ok_or("Banco não inicializado")?;
    let conn = db.conn.lock().map_err(|_| "Erro ao acessar o banco")?;

    if categoria.trim().is_empty() {
        return Err("Categoria em branco".into());
    }
    if titulo.trim().is_empty() {
        return Err("Título em branco".into());
    }
    if conteudo.trim().is_empty() {
        return Err("Conteúdo em branco".into());
    }

    let linha_afetada =  conn.execute( "INSERT INTO textos (categoria, titulo, conteudo, email_associado, url_site, observacao) VALUES
     (?1, ?2, ?3, ?4, ?5, ?6)", params![categoria, titulo, conteudo, email_associado, url_site, observacao], )
     .map_err(|e| format!("Erro ao inserir: {}", e))?;

    if linha_afetada == 0 {
        return Err("Erro ao inserir texto".into());
    }

    Ok(comandos::format_retorno_json(
        true,
        "Inserido com sucesso",
        "ok",
    ))
}

#[tauri::command]
pub fn listar_texto_completo(
    filtro: &str,
    categoria: &str,
    page: i64,
    state: tauri::State<CryptoKey>,
) -> Result<String, String> {
    let db = DB_INSTACE.get().ok_or("Banco não inicializado")?;
    let conn = db.conn.lock().map_err(|_| "Erro ao acessar o banco")?;
    let sql = if categoria.trim() == "favoritos" {
        "SELECT * FROM textos
     WHERE 
     (? = '' OR categoria = ?) AND
     (titulo LIKE ? 
     OR url_site LIKE ? 
     OR email_associado LIKE ?)
     AND favorito = 1
     ORDER BY id DESC
     LIMIT 10 OFFSET ?"
    } else {
        "SELECT * FROM textos
     WHERE 
     (? = '' OR categoria = ?) AND
     (titulo LIKE ? 
     OR url_site LIKE ? 
     OR email_associado LIKE ?)
     ORDER BY id DESC
     LIMIT 12 OFFSET ?"
    };

    let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
    let sql_coount = if categoria.trim() == "favoritos" {
        "SELECT COUNT(*) AS total FROM textos
     WHERE 
     (? = '' OR categoria = ?) AND
     (titulo LIKE ? 
     OR url_site LIKE ? 
     OR email_associado LIKE ?)
     AND favorito = 1
     ORDER BY id DESC"
    } else {
        "SELECT COUNT(*) AS total FROM textos
     WHERE 
     (? = '' OR categoria = ?) AND
     (titulo LIKE ? 
     OR url_site LIKE ? 
     OR email_associado LIKE ?)
     ORDER BY id DESC"
    };

    let mut stmt_count = conn.prepare(sql_coount).map_err(|e| e.to_string())?;

    let offset = (page - 1) * 12;
    let filtros = format!("%{}%", filtro);
    let categoria_f = format!(
        "{}",
        if categoria.trim() == "favoritos" {
            ""
        } else {
            categoria
        }
    );

    let guard = state.key.lock().unwrap();
    let key = guard.as_ref().ok_or("Usuário não autenticado")?;

    let lista: Vec<_> = stmt
        .query_map(
            [
                &categoria_f,
                &categoria_f,
                &filtros,
                &filtros,
                &filtros,
                &offset.to_string(),
            ],
            |row| {
                let conteudo = row.get::<_, String>(3)?;
                let descripty = match crypto::decrypt(key, &conteudo) {
                    Ok(d) => d,
                    Err(e) => format!("Erro na descriptografia: {}", e),
                };
                Ok(json!({
                    "id": row.get::<_, i64>(0)?,
                    "categoria": row.get::<_, String>(1)?,
                    "titulo": row.get::<_, String>(2)?,
                    "conteudo_descripty": descripty,
                    "email_associado": row.get::<_, Option<String>>(4)?,
                    "url_site": row.get::<_, Option<String>>(5)?,
                    "observacao": row.get::<_, Option<String>>(6)?,
                    "favorito": row.get::<_, bool>(7)?,
                    "created_at": row.get::<_, String>(8)?,
                }))
            },
        )
        .map_err(|e| e.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|e| e.to_string())?;

    let total_stmt = stmt_count
        .query_row(
            [&categoria_f, &categoria_f, &filtros, &filtros, &filtros],
            |row| row.get::<_, i64>(0),
        )
        .map_err(|e| e.to_string())?;

    let limit = 12;
    let total = total_stmt;

    let dados = json!({
        "itens": lista,
        "total": total,
        "limit": limit,
    });

    Ok(comandos::format_retorno_json(true, "Listado.", dados))
}

#[tauri::command]
pub fn cadastrar_usuario(usuario: &str, senha: &str, email: &str) -> Result<String, String> {
    let db = DB_INSTACE.get().ok_or("Banco não inicializado")?;
    let conn = db.conn.lock().map_err(|_| "Erro ao acessar o banco")?;
    let senha_criptografa = crypto::criptografar_senha(&senha)?;

    if usuario.trim().is_empty() {
        return Err("Usuário em branco".into());
    }
    if email.trim().is_empty() {
        return Err("Email em branco".into());
    }
    if senha.trim().is_empty() {
        return Err("Senha em branco".into());
    }

    let linha_afetado = conn
        .execute(
            "INSERT INTO usuarios (usuario,email,senha) VALUES (?1, ?2, ?3)",
            params![usuario, email, senha_criptografa],
        )
        .map_err(|e| format!("Erro ao inserir: {}", e))?;

    if linha_afetado == 0 {
        return Err("Erro ao cadastrar usuário".into());
    }

    Ok(comandos::format_retorno_json(
        true,
        "Inserido com sucesso",
        "ok",
    ))
}

#[tauri::command]
pub fn consultar_login(
    email: &str,
    senha: &str,
    state: tauri::State<CryptoKey>,
) -> Result<String, String> {
    let db = DB_INSTACE.get().ok_or("Banco não inicializado")?;
    let conn = db.conn.lock().map_err(|_| "Erro ao acessar o banco")?;

    let mut smt = conn
        .prepare("SELECT * FROM usuarios WHERE email = ?")
        .map_err(|e| format!("Erro na consulta: {}", e.to_string()))?;

    let senha_db: String = smt
        .query_row([email], |row| row.get(3))
        .map_err(|_| "Usuario ou senha inválidos.")?;

    if crypto::verificar_senha(senha, &senha_db) {
        let key = crypto::derive_key(senha);
        let mut guard = state.key.lock().unwrap();
        *guard = Some(key);

        Ok(comandos::format_retorno_json(true, "OK", ""))
    } else {
        Err("Usuário ou senha inválidos".into())
    }
}

#[tauri::command]
pub fn consultar_cadastro_login() -> Result<String, String> {
    let db = DB_INSTACE.get().ok_or("Banco não inicializado")?;
    let conn = db.conn.lock().map_err(|_| "Erro ao acessar o banco")?;

    let mut stmt = conn
        .prepare("SELECT COUNT(*) FROM usuarios")
        .map_err(|e| format!("Erro na consulta: {}", e))?;

    let total: i64 = stmt
        .query_row([], |row| row.get(0))
        .map_err(|e| format!("Erro ao verificar usuário: {}", e))?;

    if total > 0 {
        return Ok(comandos::format_retorno_json(
            true,
            "USUARIO_EXISTE",
            "Já existe usuário cadastrado",
        ));
    }

    Ok(comandos::format_retorno_json(
        true,
        "SEM_USUARIO",
        "Pode cadastrar",
    ))
}

#[tauri::command]
pub fn excluir_texto(id: i64) -> Result<String, String> {
    let db = DB_INSTACE.get().ok_or("Banco não inicializado")?;
    let conn = db.conn.lock().map_err(|_| "Erro ao acessar o banco")?;
    if id <= 0 {
        return Err("ID inválido".into());
    }
    let linhas_afetadas = conn
        .execute("DELETE FROM textos WHERE id = ?", params![id])
        .map_err(|e: rusqlite::Error| format!("Erro ao excluir: {}", e))?;

    if linhas_afetadas == 0 {
        return Err("Nenhum texto encontrado para excluir".into());
    }

    Ok(comandos::format_retorno_json(
        true,
        "Texto excluído com sucesso",
        "",
    ))
}

#[tauri::command]
pub fn atualizar_favorito(id: i64, favorito: bool) -> Result<String, String> {
    let db = DB_INSTACE.get().ok_or("Banco não inicializado")?;
    let conn = db.conn.lock().map_err(|_| "Erro ao acessar o banco")?;

    if id <= 0 {
        return Err("ID inválido".into());
    }

    let existe: bool = conn
        .query_row(
            "SELECT EXISTS(SELECT 1 FROM textos WHERE id = ?)",
            params![id],
            |row| row.get(0),
        )
        .map_err(|e| format!("Erro ao consultar: {}", e))?;

    if !existe {
        return Err("Registro não encontrado".into());
    }

    let linha_afetado = conn
        .execute(
            "UPDATE textos SET favorito = ? WHERE id = ?",
            params![favorito, id],
        )
        .map_err(|e: rusqlite::Error| format!("Erro ao atualizar: {}", e))?;

    if linha_afetado == 0 {
        return Err("Não foi possivel favoritar o registro".into());
    }

    Ok(comandos::format_retorno_json(
        true,
        "Texto favoritado com sucesso",
        "",
    ))
}
