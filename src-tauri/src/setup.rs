use tauri::{App, Manager};
use std::env;
use std::fs::File;
use tauri::path::BaseDirectory;
use web_audio_api::context::{AudioContext, BaseAudioContext};
use crate::commands::AppState; // Import AppState from commands
use std::error::Error; // Import Error for Result type
use std::sync::{Arc, Mutex}; // Added imports

pub fn setup_app(app: &App) -> Result<(), Box<dyn Error>> {
    let args: Vec<String> = env::args().collect();
    if args.contains(&"--autostart".to_string()) {
        let window = app.get_webview_window("main").unwrap();
        window.hide().unwrap();
    }

    let handle = app.handle();
    
    let resource_path = match handle
        .path()
        .resolve("assets/alert.mp3", BaseDirectory::Resource)
    {
        Ok(path) => path,
        Err(_) => {
            eprintln!("Failed to resolve path");
            return Ok(());
        }
    };

    let context = AudioContext::default();
    let buffer = File::open(resource_path)
        .ok()
        .and_then(|file| context.decode_audio_data_sync(file).ok());

    if buffer.is_none() {
        eprintln!("Failed to preload the audio buffer. Please check the file path.");
    }

    let state = Arc::new(AppState {
        context,
        buffer: Mutex::new(buffer),
        playing_sources: Mutex::new(Vec::new()),
    });

    app.manage(state.clone()); 

    Ok(())
}
