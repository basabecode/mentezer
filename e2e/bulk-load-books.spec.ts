import { expect, test } from "@playwright/test";
import fs from "fs";
import path from "path";
import { parseOptionalPositiveInt, selectChunksForBook } from "../scripts/bulk-load-utils";

const SCRIPT_PATH = path.resolve(__dirname, "../scripts/bulk-load-books.ts");

test.describe("carga masiva de libros", () => {
  test("expone controles para proteger el free tier de Supabase", () => {
    const script = fs.readFileSync(SCRIPT_PATH, "utf8");

    expect(script).toContain("MAX_BOOKS");
    expect(script).toContain("MAX_CHUNKS_PER_BOOK");
    expect(script).toContain("DRY_RUN");
    expect(script).toContain("No se escribira en Supabase");
    expect(script).toContain("selectChunksForBook(doc.text, MAX_CHUNKS_PER_BOOK)");
  });

  test("interpreta limites configurables de ensayo sin valores invalidos", () => {
    expect(parseOptionalPositiveInt("2")).toBe(2);
    expect(parseOptionalPositiveInt("300")).toBe(300);
    expect(parseOptionalPositiveInt("0")).toBeNull();
    expect(parseOptionalPositiveInt("-1")).toBeNull();
    expect(parseOptionalPositiveInt("abc")).toBeNull();
    expect(parseOptionalPositiveInt(undefined)).toBeNull();
  });

  test("limita chunks por libro antes de generar embeddings", () => {
    const paragraphs = Array.from({ length: 12 }, (_, index) =>
      `Parrafo ${index + 1}. ${"contenido clinico relevante ".repeat(30)}`
    ).join("\n\n");

    const { generatedChunks, selectedChunks } = selectChunksForBook(paragraphs, 3);

    expect(generatedChunks.length).toBeGreaterThan(3);
    expect(selectedChunks).toHaveLength(3);
    expect(selectedChunks[0]).toContain("contenido clinico relevante");
  });
});
