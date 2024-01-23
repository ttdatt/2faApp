// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::Local;
use std::fs::OpenOptions;
use std::io::Write;
use tauri::{CustomMenuItem, Manager, Menu, Submenu};

fn try_write_log(
    message: &str,
    filename: &str,
    append: bool,
) -> Result<(), Box<dyn std::error::Error>> {
    let exec_path = std::env::current_exe()?;
    let exec_dir = exec_path.parent().ok_or("No parent directory")?;
    let log_path = exec_dir.join(filename);

    let mut file = OpenOptions::new()
        .append(append)
        .create(true)
        .write(true)
        .open(log_path)?;

    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
    let log_entry = format!("{}: {}\n", timestamp, message);

    file.write_all(log_entry.as_bytes())?;
    Ok(())
}

#[tauri::command]
fn write_log(message: &str) {
    if let Err(e) = try_write_log(message, "log.txt", true) {
        eprintln!("Recovered from error: {:?}", e);
    }
}

fn main() {
    let quit = CustomMenuItem::new("quit".to_string(), "Quit").accelerator("CmdOrControl+W");
    let import = CustomMenuItem::new("import".to_string(), "Import").accelerator("CmdOrControl+I");
    let submenu = Submenu::new("File", Menu::new().add_item(import).add_item(quit));
    let menu = Menu::new().add_submenu(submenu);

    write_log("----------------------------------------");
    write_log("application started");
    tauri::Builder::default()
        .menu(menu)
        .on_menu_event(|event| match event.menu_item_id() {
            "quit" => {
                std::process::exit(0);
            }
            "import" => {
                let _ = event.window().emit_all("open-dialog", "");
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![write_log])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
