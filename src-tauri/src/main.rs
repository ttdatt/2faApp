// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use chrono::{DateTime, Local};
use std::fs::{self, metadata, OpenOptions};
use std::io::Write;
use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    Manager,
};

fn try_write_log(
    message: &str,
    filename: &str,
    should_append: bool,
) -> Result<(), Box<dyn std::error::Error>> {
    let exec_path = std::env::current_exe()?;
    let exec_dir = exec_path.parent().ok_or("No parent directory")?;
    let log_path = exec_dir.join(filename);

    let file_still_fresh = if log_path.exists() {
        let file_meta = metadata(&log_path)?;

        let created_at: DateTime<Local> = file_meta.created()?.into();
        let now: DateTime<Local> = Local::now();

        let duration = now.signed_duration_since(created_at);
        let day_difference = duration.num_days().abs();

        day_difference <= 1
    } else {
        false
    };

    let append = should_append && file_still_fresh;

    if !append {
        fs::remove_file(&log_path).ok();
    }
    let mut file = OpenOptions::new()
        .append(true)
        .create(true)
        .write(true)
        .open(log_path)?;

    let timestamp = Local::now().format("%Y-%m-%d %H:%M:%S%.3f");
    let log_entry = format!("{}: {}\n", timestamp, message,);

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
    write_log("----------------------------------------");
    write_log("application started");
    tauri::Builder::default()
        .setup(|app| {
            let quit = MenuItemBuilder::new("Quit")
                .id("quit")
                .accelerator("CmdOrControl+W");
            let import = MenuItemBuilder::new("Import")
                .id("import")
                .accelerator("CmdOrControl+I");
            let submenu = SubmenuBuilder::new(app, "App").build()?;
            submenu.append(&import.build(app)?)?;
            submenu.append(&quit.build(app)?)?;
            let menu = MenuBuilder::new(app)
                .text("file", "File")
                .item(&submenu)
                .build()?;
            let _ = app.set_menu(menu);
            app.on_menu_event(move |app, event| {
                if event.id() == "quit" {
                    app.exit(0);
                } else if event.id() == "import" {
                    println!("import triggered!");
                    if let Err(e) = app.emit("open-dialog", "") {
                        eprintln!("Failed to emit event: {:?}", e);
                    }
                }
            });
            Ok(())
        })
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![write_log])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
