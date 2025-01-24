import { invoke } from '@tauri-apps/api/core';

let isSoundPlaying = false;

export async function startSound() {
    if (isSoundPlaying) {
        return;
    }

    try {
        await invoke('play_sound');
        isSoundPlaying = true;
    } catch (e) {
        console.error(e);
    }
}

export async function stopSound() {
    if (!isSoundPlaying) {
        return;
    }

    try {
        await invoke('stop_sound');
        isSoundPlaying = false;
    } catch (e) {
        console.error(e);
    }
}