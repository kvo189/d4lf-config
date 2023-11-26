const { shell } = require('electron');
const fs = require('fs').promises; // Use promises API for simpler async handling

export async function openFile(filePath: string) {
  try {
    await fs.access(filePath);
    const result = await shell.openPath(filePath);
    if (result) {
      console.error('Error opening file:', result);
      throw new Error(`Error opening file ${result}`);
    }
  } catch (error) {
    console.error('Failed to open file:', error);
    throw error;
  }
}
