import { promises as fs } from 'node:fs';
import path from 'node:path';
import type { Plugin } from 'vite';

export function aliases(): Plugin {
  return {
    enforce: 'pre', // run as early as possible
    name: 'api-aware-alias',
    async resolveId(source: string, importer?: string) {
      if (!source.startsWith('@/')) return;
      const sourcePath = source.slice('@/'.length);
      const extensions = ['.ts', '.js', '.tsx', '.jsx'];

      for (const ext of extensions) {
        const filePath = path.resolve(__dirname, '../', 'src', `./${sourcePath}${ext}`);

        try {
          await fs.access(filePath);
          return filePath;
        } catch {
          // File does not exist, check the next extension
        }
      }
      return;
    },
  };
}
