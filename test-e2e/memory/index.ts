import * as fs from 'fs/promises';
export default class Memory {
  array = (...values: any[]): any[] => values;
  json = async (path: string): Promise<any> => {
    const file = await fs.readFile(path, 'utf-8');
    return JSON.parse(file);
  };

  timestamp = () => Math.floor(Date.now() / 1000);
  user = JSON.parse(process.env.GMAIL_KEY);
}
