import fs from "fs";
import path from "path";
import { PDFParse } from "pdf-parse";

export interface ExtractedDoc {
  filename: string;
  fullPath: string;
  folder: string;
  text: string;
  pageCount: number;
  sizeBytes: number;
}

export interface DiscoveredPdf {
  filename: string;
  fullPath: string;
  folder: string;
}

export async function extractPdfText(filePath: string): Promise<string> {
  const buffer = fs.readFileSync(filePath);
  const parser = new PDFParse({ data: buffer });
  try {
    const data = await parser.getText();
    return data.text;
  } finally {
    await parser.destroy();
  }
}

function cleanText(raw: string): string {
  return raw
    .replace(/\f/g, "\n")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[^\S\n]+/g, " ")
    .trim();
}

export function discoverBookPdfFiles(rootDir: string): DiscoveredPdf[] {
  if (!fs.existsSync(rootDir)) {
    console.error(`[ERROR] Directorio no encontrado: ${rootDir}`);
    return [];
  }

  const entries = fs.readdirSync(rootDir, { withFileTypes: true });
  const rootFiles = entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
    .map((entry) => ({
      filename: entry.name,
      fullPath: path.join(rootDir, entry.name),
      folder: "sin-clasificar",
    }));

  const nestedFiles = entries
    .filter((entry) => entry.isDirectory())
    .flatMap((folder) => {
      const folderPath = path.join(rootDir, folder.name);
      return fs
        .readdirSync(folderPath, { withFileTypes: true })
        .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".pdf"))
        .map((entry) => ({
          filename: entry.name,
          fullPath: path.join(folderPath, entry.name),
          folder: folder.name,
        }));
    });

  return [...rootFiles, ...nestedFiles];
}

export async function scanBooksFolder(rootDir: string): Promise<ExtractedDoc[]> {
  const results: ExtractedDoc[] = [];
  const pdfFiles = discoverBookPdfFiles(rootDir);

  if (pdfFiles.length === 0) {
    console.log(`[SCAN] No se encontraron PDFs en ${rootDir}`);
    return results;
  }

  for (const file of pdfFiles) {
    const stats = fs.statSync(file.fullPath);

    if (stats.size > 50 * 1024 * 1024) {
      console.warn(`[SKIP] ${file.filename} supera 50MB`);
      continue;
    }

    console.log(`[SCAN] ${file.folder}/${file.filename} (${Math.round(stats.size / 1024)}KB)`);

    try {
      const rawText = await extractPdfText(file.fullPath);
      const text = cleanText(rawText);

      if (text.length < 100) {
        console.warn(`[WARN] ${file.filename}: texto muy corto (${text.length} chars) — posible PDF escaneado`);
        continue;
      }

      results.push({
        filename: file.filename,
        fullPath: file.fullPath,
        folder: file.folder,
        text,
        pageCount: rawText.split("\f").length,
        sizeBytes: stats.size,
      });
    } catch (err) {
      console.error(`[ERROR] No se pudo leer ${file.filename}:`, err);
    }
  }

  return results;
}
