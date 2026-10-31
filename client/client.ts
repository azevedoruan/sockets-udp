import * as udp from "dgram";
import { ClientDatas, encode, Datagram, MessageType, decode } from "../protocol/protocol";
import { Signal } from "../utils/signal";
import { isEmoji, isURL } from "../utils/validators";
import { text } from "stream/consumers";

export class Client {

    messageReceived: Signal<[string, string, string], void> = null;
    data: ClientDatas = null;
    private udpClient: udp.Socket;

    public constructor() {
        this.udpClient = udp.createSocket('udp4');
    }

    public async startConnection(nickname: string, host: string, port: number): Promise<void> {
        if (!nickname) throw new Error("Nickname é obrigatório.");
        if (!port) throw new Error("Port é obrigatório");
        
        this.data = {
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
                const decoded = decode(msgStream, rinfo);
                if (!decoded)
                    return;

                const { clientDatas, dgram } = decoded;
                this.messageReceived?.([MessageType[dgram.messageType], clientDatas?.nickname ?? "user", dgram.message]);
            });

            this.udpClient.once('error', reject);
            this.udpClient.bind(port, host); // Configura porta e endereço
        })
    }

    public close(): void {
        this.udpClient?.close();
    }

    public async sendDefault(message: string): Promise<void> {
        const datagram: Datagram = {
            messageType: MessageType.DEFAULT,
            nickSize: this.data?.nickname.length ?? 0,
            nickname: this.data?.nickname ?? 'user',
            messageSize: message.length,
            message
        };

        const dgramBuffer = encode(this.data, datagram);
        this.udpClient.send(dgramBuffer, this.data?.port, this.data?.host);
    }

    public async sendEmoji(message: string): Promise<void> {
        if (!isEmoji(message))
            throw new Error("Mensagem deve ser um emoji.");

        const datagram: Datagram = {
            messageType: MessageType.EMOJI,
            nickSize: this.data?.nickname.length ?? 0,
            nickname: this.data?.nickname ?? 'user',
            messageSize: message.length,
            message
        };

        const dgramBuffer = encode(this.data, datagram);
        this.udpClient.send(dgramBuffer, this.data?.port, this.data?.host);
    }

    public async sendURL(url: string): Promise<void> {
        if (!isURL(url))
            throw new Error("URL inválida.");

        const datagram: Datagram = {
            messageType: MessageType.URL,
            nickSize: this.data?.nickname.length ?? 0,
            nickname: this.data?.nickname ?? 'user',
            messageSize: url.length,
            message: url
        };

        const dgramBuffer = encode(this.data, datagram);
        this.udpClient.send(dgramBuffer, this.data?.port, this.data?.host);
    }

    public async sendEcho(): Promise<void> {

    }


}