import { promises as fs } from 'fs';
import * as yaml from 'js-yaml';
import * as path from 'path';

export async function readYamlFile(filePath: string): Promise<any> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return yaml.load(data);
  } catch (err) {
    throw err;
  }
}

export async function readProfileFiles(profilesPath: string): Promise<{ fileName: string, content: any }[]> {
  try {
    const files = await fs.readdir(profilesPath);
    const yamlFiles = files.filter(file => file.endsWith('.yaml') || file.endsWith('.yml'));

    const fileContents = await Promise.all(
      yamlFiles.map(async file => {
        const content = await readYamlFile(path.join(profilesPath, file));
        return { fileName: file, content };
      })
    );

    return fileContents;
  } catch (err) {
    throw err;
  }
}

export async function writeYamlFile(filePath: string, yamlString: string) {
  try {
    // const yamlData = convertToYaml(data);
    await fs.writeFile(filePath, yamlString, 'utf8');
  } catch (err) {
    throw err;
  }
}
