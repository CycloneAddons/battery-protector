use tauri::{State};
use std::sync::{Arc, Mutex};
use web_audio_api::node::{AudioBufferSourceNode, AudioScheduledSourceNode};
use web_audio_api::context::{AudioContext, BaseAudioContext};
use web_audio_api::AudioBuffer;
use web_audio_api::node::AudioNode; // Added this import

// Define AppState struct inside the commands file
pub struct AppState {
    pub context: AudioContext,
    pub buffer: Mutex<Option<AudioBuffer>>,
    pub playing_sources: Mutex<Vec<AudioBufferSourceNode>>,
}

#[tauri::command]
pub fn play_sound(state: State<Arc<AppState>>) -> Result<(), String> {
    let context = &state.context;
    let lock = state.buffer.lock().unwrap();
    let buffer = lock.as_ref().ok_or("Audio buffer not loaded")?;

    let mut src = context.create_buffer_source();
    src.set_buffer(buffer.clone());
    src.set_loop(true);

    let biquad = context.create_biquad_filter();
    src.connect(&biquad);  // connect using AudioNode trait
    biquad.connect(&context.destination());  // connect using AudioNode trait

    src.start();

    state.playing_sources.lock().unwrap().push(src);

    Ok(())
}

#[tauri::command]
pub fn stop_sound(state: State<Arc<AppState>>) -> Result<(), String> {
    let mut sources = state.playing_sources.lock().unwrap();

    for mut src in sources.drain(..) {
        src.stop();
    }

    Ok(())
}
