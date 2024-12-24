import { isPermissionGranted, requestPermission, sendNotification } from '@tauri-apps/plugin-notification';

async function notifyUser(msg: string) {
  let permissionGranted = await isPermissionGranted();
  if (!permissionGranted) {
    const permission = await requestPermission();
    permissionGranted = permission === 'granted';
  }
  if (permissionGranted) {
    sendNotification({ title: 'Battery Alert', body: msg });
  }
}

export { notifyUser };
