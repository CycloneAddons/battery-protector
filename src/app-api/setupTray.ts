import { TrayIcon } from '@tauri-apps/api/tray';
import { Menu } from '@tauri-apps/api/menu';
import { getCurrentWindow } from '@tauri-apps/api/window';

let tray: TrayIcon;

export const setupTray = async ({ tooltip, icon }: { tooltip?: string, icon?: string }) => {
  if (!tray) {
    // Create tray icon with menu
    const menu = await Menu.new({
      items: [
        {
          id: 'quit',
          text: 'Exit',
          action: async () => {
            console.log('Quit pressed');
            getCurrentWindow().destroy()// Quit the app
          },
        },
      ],
    });

    const options = {
      menu,
      menuOnLeftClick: false, // Ensure the menu appears on right-click only
      action: async (event) => {
        if (event.type === 'Click' && event.button === "Left") {
          console.log('Tray open'); // Left-click action
          const mainWindow = getCurrentWindow();
          await mainWindow.show();
          await mainWindow.unminimize();
          await mainWindow.setFocus();
        }
      },
    };

    // Initialize tray icon with the options
    tray = await TrayIcon.new(options);
  }

  if (tooltip) tray.setTooltip(tooltip);
  if (icon) await tray.setIcon(icon);

  const mainWindow = getCurrentWindow();
  // Listen for the close button event
  mainWindow.listen('tauri://close-requested', async () => {
    console.log('Close button clicked');
    await mainWindow.hide(); // Hide the window instead of quitting
  });
};

export const updateTray = async ({ tooltip, icon }: { tooltip?: string, icon?: string }) => {
  if (tray) {
    if (tooltip) await tray.setTooltip(tooltip);
    if (icon) await tray.setIcon(icon);
  }
};
