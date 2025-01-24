import { writeTextFile, readTextFile, exists, BaseDirectory } from '@tauri-apps/plugin-fs';

// File path in the AppConfig directory
const CONFIG_FILE = 'config.json';

/**
 * Writes a key-value pair to the config file.
 * @param {string} key - The key to store the value under.
 * @param {*} value - The value to store (can be string, array, object, etc.).
 */
export async function write(key, value) {
  let data = {};

  // Check if the file exists
  const fileExists = await exists(CONFIG_FILE, { baseDir: BaseDirectory.AppConfig });

  // Read existing data if the file exists
  if (fileExists) {
    const fileContent = await readTextFile(CONFIG_FILE, { baseDir: BaseDirectory.AppConfig });
    data = JSON.parse(fileContent);
  }

  // Add or update the key-value pair
  data[key] = value;

  // Write the updated data back to the file with proper indentation for readability
  try {
    await writeTextFile(CONFIG_FILE, JSON.stringify(data, null, 2), {
      baseDir: BaseDirectory.AppConfig,
    });
  } catch (error) {
    console.error('Error writing config file:', error);
  }
}


/**
 * Reads a value by its key from the config file.
 * @param {string} key - The key to retrieve the value for.
 * @returns {*} The value stored under the specified key, or null if the key does not exist.
 */
export async function read(key) {
  // Check if the file exists
  const fileExists = await exists(CONFIG_FILE, { baseDir: BaseDirectory.AppConfig });

  if (!fileExists) {
    return null; // Return null if the file doesn't exist
  }

  // Read the file contents
  const fileContent = await readTextFile(CONFIG_FILE, { baseDir: BaseDirectory.AppConfig });
  const data = JSON.parse(fileContent);

  // Return the value associated with the key or null if not found
  return data[key] ?? null;
}


/**
 * Deletes all data from the config file.
 */
export async function clear() {
  // Overwrite the config file with an empty object
  try {
    await writeTextFile(CONFIG_FILE, JSON.stringify({}, null, 2), {
      baseDir: BaseDirectory.AppConfig,
    });
  } catch (error) {
    console.error('Error clearing config file:', error);
  }
}