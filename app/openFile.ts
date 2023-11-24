const { shell } = require('electron');

export async function openFile(filePath: string) {
  try {
    const result = await shell.openPath(filePath);
    if (result) {
      console.error('Error opening file:', result);
    }
  } catch (error) {
    console.error('Failed to open file:', error);
  }
}
