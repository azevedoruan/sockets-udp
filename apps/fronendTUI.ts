import { Client } from "../client/client";
import * as readline from "readline/promises";
import { withTimeout } from "../utils/timeout";
import { emojiReader } from "../emojis/emojireader";

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
        this.client.messageReceived = async ([type, nickname, message]) => {
            await this.onReceiveMessage(type, nickname, message);
        }
    }

    public async update(): Promise<void> {
        const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
        let running = true;
        
        while(running) {
            try {
                const msgType = (await rl.question(this.MENU)).trim();
                switch(msgType) {
                    case "1": {
                        const message = (await rl.question("> ")).trim();
                        if (!message) break;
                        await this.client.sendDefault(message);
                        break;
                    }
                    case "2": {
                        const message = (await rl.question("> ")).trim();
                        if (!message) break;
                        await this.client.sendEmoji(message);
                        break;
                    }
                    case "3": {
                        const message = (await rl.question("> ")).trim();
                        if (!message) break;
                        await this.client.sendURL(message);
                        break;
                    }
                    case "4": {
                        const message = (await rl.question("> ")).trim();
                        if (!message) break;
                        const response = await withTimeout(this.client.sendEcho(message), 5000, new Error("Host não responde ao Echo."));
                        console.log(response);
                        break;
                    }
                    case "0": {
                        console.log("\nTchau!\n");
                        running = false;
                        break;
                    }
                    default: {
                        console.log("Opção inválida.");
                    }
                }
            } catch(err) {
                const errmsg = err instanceof Error ? err.message : String(err);
                console.log(`\n${errmsg}\n`);
            }
        }

        rl.close();
        this.client.close();
    }

    public async onReceiveMessage(type: string, receiverName: string, message: string): Promise<void> {
        let msg = message;

        if (type === "EMOJI") {
            msg = await emojiReader(Number(message));
        }

        console.log(`\n\n[${type}] ${receiverName}: ${msg}\n`);
    }
}