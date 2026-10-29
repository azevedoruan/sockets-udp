import { Client, updateTerminal } from "./client";

async function main() {
    const client = new Client();
    await client.startConnection(process.argv[2], '127.0.0.1', Number(process.argv[3]));
    await updateTerminal(client);
}

// Chama a função main e trata erro.
main().catch((err) => {
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
});