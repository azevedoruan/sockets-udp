import { Client } from "./client";
import { FrontendTUI } from "./fronendTUI";

async function main() {
    const client = new Client();
    const tui = new FrontendTUI();
    
    await client.startConnection(process.argv[2], '127.0.0.1', Number(process.argv[3]));
    await tui.update(client);
}

// Chama a função main e trata erro.
main().catch((err) => {
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
});