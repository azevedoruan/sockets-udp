import * as udp from "dgram";
import { ClientDatas, encode, Datagram, MessageType, decode } from "../protocol/protocol";

export class Client {

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

                console.log(`[${MessageType[dgram.messageType]}] ${clientDatas?.nickname}: ${dgram.message}`);
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

        this.udpClient.send(dgramBuffer, this.data?.port, this.data?.host, (err, len) => {
            if (err) console.log('ERROR: ', err);
            console.log('sent length ', len);
        })
    }
}