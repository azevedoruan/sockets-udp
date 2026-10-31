import { Client } from "../client/client";
import * as readline from "readline/promises";

export class FrontendTUI {

    private MENU = `
========================================
1 - DEFAULT    (mensagem normal)
2 - EMOJI      
3 - URL        
4 - ECHO       (envia e recebe a mesma mensagem para indicar que usuário está ativo)
0 - Sair
========================================
Escolha uma opção: `;

    private client: Client;

    public constructor(client: Client) {
        this.client = client;
        this.client.messageReceived = ([type, nickname, message]) => {
            this.onReceiveMessage(type, nickname, message);
        }
    }

    public async update(): Promise<void> {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        let running = true;
        while(running) {
            const msgType = (await rl.question(this.MENU)).trim();
            switch(msgType) {
                case "1": {
                    const message = (await rl.question("> ")).trim();
                    if (!message)
                        break;

                    await this.client.sendDefault(message);
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
        this.client.close();
    }

    public onReceiveMessage(type: string, receiverName: string, message: string): void {
        console.log(`\n[${type}] ${receiverName}: ${message}\n`);
    }
}