import { Client } from "./client";
import { FrontendTUI } from "../apps/fronendTUI";

async function main() {
    const client = new Client(process.argv[2], 'localhost', Number(process.argv[3]));
    const tui = new FrontendTUI(client);
    
    await client.startConnection('localhost', Number(process.argv[4]));
    await tui.update();
}

// Chama a função main e trata erro.
main().catch((err) => {
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
});


/* TODO
- Aplicação de terminal mais agradavel. Possivel conversar com vários Hosts em diferentes chats.
*/