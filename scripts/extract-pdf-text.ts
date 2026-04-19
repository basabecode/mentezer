import fs from "fs";
import path from "path";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require("pdf-parse");

export interface ExtractedDoc {
  filename: string;
  fullPath: string;
  folder: string;
  text: string;
  pageCount: number;
  sizeBytes: number;
}

export async function extractPdfText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const data = await pdfParse(buffer);
  return data.text as string;
}

function cleanText(raw: string): string {
  return raw
    .replace(/\f/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]+/g, " ")
    .trim();
}

export async function scanBooksFolder(rootDir: string): Promise<ExtractedDoc[]> {
  const results: ExtractedDoc[] = [];

  if (!fs.existsSync(rootDir)) {
    console.error(`[ERROR] Directorio no encontrado: ${rootDir}`);
    return results;
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const folders = entries.filter((d) => d.isDirectory());

  for (const folder of folders) {
    const folderPath = path.join(rootDir, folder.name);
    const files = fs
      .readdirSync(folderPath)
      .filter((f) => f.toLowerCase().endsWith(".pdf"));

    for (const file of files) {
      const fullPath = path.join(folderPath, file);
      const stats = fs.statSync(fullPath);

      if (stats.size > 50 * 1024 * 1024) {
        console.warn(`[SKIP] ${file} supera 50MB`);
        continue;
      }

      console.log(`[SCAN] ${folder.name}/${file} (${Math.round(stats.size / 1024)}KB)`);

      try {
        const rawText = await extractPdfText(fullPath);
        const text = cleanText(rawText);

        if (text.length < 100) {
          console.warn(`[WARN] ${file}: texto muy corto (${text.length} chars) — posible PDF escaneado`);
          continue;
        }

        results.push({
          filename: file,
          fullPath,
          folder: folder.name,
          text,
          pageCount: rawText.split("\f").length,
          sizeBytes: stats.size,
        });
      } catch (err) {
        console.error(`[ERROR] No se pudo leer ${file}:`, err);
      }
    }
  }

  return results;
}
