// #![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// use std::sync::{Arc, Mutex};
// use tauri::command;
// use web_audio_api::context::{AudioContext, BaseAudioContext};
// use web_audio_api::node::{AudioNode, AudioScheduledSourceNode};
// use web_audio_api::AudioBuffer; // Import AudioBuffer directly

// struct AppState {
//     context: AudioContext,
//     buffer: Mutex<Option<AudioBuffer>>, // Correct type for storing the buffer
//     playing_sources: Mutex<Vec<web_audio_api::node::AudioBufferSourceNode>>,
// }

// #[command]
// fn play_sound(state: tauri::State<Arc<AppState>>) -> Result<(), String> {
//     let context = &state.context;

//     // Acquire the lock on the buffer and hold it
//     let lock = state.buffer.lock().unwrap();
//     let buffer = lock.as_ref().ok_or("Audio buffer not loaded")?;

//     // Setup an AudioBufferSourceNode
//     let mut src = context.create_buffer_source();
//     src.set_buffer(buffer.clone()); // Use the preloaded buffer
//     src.set_loop(true); // Enable looping

//     // Create a biquad filter
//     let biquad = context.create_biquad_filter();

//     // Connect the audio nodes
//     src.connect(&biquad);
//     biquad.connect(&context.destination());

//     // Start playback immediately
//     src.start();

//     // Save the source node for later control
//     state.playing_sources.lock().unwrap().push(src);

//     Ok(())
// }

// #[command]
// fn stop_sound(state: tauri::State<Arc<AppState>>) -> Result<(), String> {
//     // Acquire the lock on the sources
//     let mut sources = state.playing_sources.lock().unwrap();

//     // Stop all playing sources
//     for mut src in sources.drain(..) {
//         src.stop(); // Stop the playback
//     }

//     Ok(())
// }

// fn main() {
//     // Initialize the audio context
//     let context = AudioContext::default();

//     // Preload the audio buffer during initialization
//     let buffer = std::fs::File::open("./assets/alert.mp3")
//         .ok()
//         .and_then(|file| context.decode_audio_data_sync(file).ok());

//     if buffer.is_none() {
//         eprintln!("Failed to preload the audio buffer. Please check the file path.");
//     }

//     // Shared state with preloaded buffer
//     let state = Arc::new(AppState {
//         context,
//         buffer: Mutex::new(buffer), // Store buffer in Mutex
//         playing_sources: Mutex::new(Vec::new()),
//     });

//     tauri::Builder::default()
//         .plugin(tauri_plugin_notification::init())
//         .plugin(tauri_plugin_global_shortcut::Builder::new().build())
//         .manage(state.clone()) // Share state with commands
//         .invoke_handler(tauri::generate_handler![play_sound, stop_sound])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }
