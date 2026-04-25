import { expect, test } from "@playwright/test";
import fs from "fs";
import os from "os";
import path from "path";
import { discoverBookPdfFiles } from "../scripts/extract-pdf-text";

test.describe("escaneo de libros clinicos", () => {
  test("detecta PDFs en raiz como sin-clasificar y PDFs en subcarpetas como hint", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mentezer-books-"));
    const cbtDir = path.join(root, "01-cbt");
    fs.mkdirSync(cbtDir);

    const rootPdf = path.join(root, "Libro sin categoria.pdf");
    const nestedPdf = path.join(cbtDir, "Manual TCC.pdf");
    const ignoredTxt = path.join(root, "notas.txt");

    fs.writeFileSync(rootPdf, "fake pdf");
    fs.writeFileSync(nestedPdf, "fake pdf");
    fs.writeFileSync(ignoredTxt, "not pdf");

    const files = discoverBookPdfFiles(root).map((file) => ({
      filename: file.filename,
      folder: file.folder,
    }));

    expect(files).toEqual(
      expect.arrayContaining([
        { filename: "Libro sin categoria.pdf", folder: "sin-clasificar" },
        { filename: "Manual TCC.pdf", folder: "01-cbt" },
      ])
    );
    expect(files).toHaveLength(2);

    fs.rmSync(root, { recursive: true, force: true });
  });
});
