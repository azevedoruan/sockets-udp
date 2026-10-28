import * as udp from "dgram";
import * as readline from "readline/promises";

export class Client {

    private udpClient: udp.Socket

    public constructor() {
        this.udpClient = udp.createSocket('udp4');
    }

    public async startConnection(nickname: string, host: string, port: number): Promise<void> {
        if (!nickname) throw new Error("Nickname é obrigatório.");
        if (!port) throw new Error("Port é obrigatório");
        
        return new Promise<void>((resolve, reject) => {
            this.udpClient.once('listening', () => {
                console.log(`Client ${nickname} Running on port ${port}`);
                resolve();
            });

            this.udpClient.on('message', (msgStream, rinfo) => {
                console.log(`Message Received: ${msgStream.toString()}`);
            });

            this.udpClient.once('error', reject);
            this.udpClient.bind(port, host); // Configura porta e endereço
        })
    }

    public close(): void {
        this.udpClient?.close();
    }
}

const MENU = `
========================================
 1 - DEFAULT    (mensagem normal)
 2 - EMOJI      
 3 - URL        
 4 - ECHO       (envia e recebe a mesma mensagem para indicar que usuário está ativo)
 0 - Sair
========================================
Escolha uma opção: `;

async function updateTerminal(client: Client): Promise<void> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let running = true;
    while(running) {
        const message = (await rl.question(MENU)).trim();
        switch(message) {
            case "1": {
                console.log("Selecionado DEFAULT");
                break;
            }
            case "0": {
                console.log("Tchau!");
                running = false;
                break;
            }
            default: {
                console.log("Opção inválida.");
            }
        }
    }

    rl.close();
    client.close();
}

async function main(): Promise<void> {
    const client = new Client();
    await client.startConnection(process.argv[2], '127.0.0.1', Number(process.argv[3]));
    await updateTerminal(client);
}

main().catch((err) => {
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
})