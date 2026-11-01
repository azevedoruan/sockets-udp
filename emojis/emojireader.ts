import { readFile } from "node:fs/promises";
import { join } from "node:path";

export async function emojiReader(index: number): Promise<string> {
    const raw = await readFile(join(__dirname, "emojis.json"), "utf-8");
    const emojis: string[] = JSON.parse(raw);

    if (!Number.isInteger(index) || index < 0 || index >= emojis.length)
        throw new Error(`Índice de emoji inválido: ${index} (válido: 0..${emojis.length - 1})`);

    return emojis[index];
}