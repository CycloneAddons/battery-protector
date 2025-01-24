import { invoke } from '@tauri-apps/api/core';



export async function startSound() {
    try {
await invoke('play_sound');
return true;
    } catch (e) {     
        console.error(e);
        return false;
    }
}

export async function stopSound() {
    try {
    await invoke('stop_sound');
    return false;
    } catch (e) {
        console.error(e);
        return true;
    }
}