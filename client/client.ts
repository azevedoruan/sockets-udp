import * as udp from "dgram";
import * as readline from "readline/promises";

export type ClientDatas = {
    nickname: string,
    host: string,
    port: number
} | null;

export class Client {

    private udpClient: udp.Socket;
    private clientData: ClientDatas = null;

    public constructor() {
        this.udpClient = udp.createSocket('udp4');
    }

    public async startConnection(nickname: string, host: string, port: number): Promise<void> {
        if (!nickname) throw new Error("Nickname é obrigatório.");
        if (!port) throw new Error("Port é obrigatório");
        
        this.clientData = {
            nickname,
            host,
            port
        };

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

    public async sendDefault(msg: string): Promise<void> {
        this.udpClient.send(msg, this.clientData?.port, this.clientData?.host, (err, len) => {
            if (err) console.log('ERROR: ', err);
            console.log('sent lenght ', len);
        })
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

export async function updateTerminal(client: Client): Promise<void> {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    let running = true;
    while(running) {
        const msgType = (await rl.question(MENU)).trim();
        switch(msgType) {
            case "1": {
                const message = (await rl.question("> ")).trim();
                if (!message)
                    break;

                await client.sendDefault(message);
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