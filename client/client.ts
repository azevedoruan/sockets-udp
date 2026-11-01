import * as udp from "dgram";
import { ClientDatas, encode, Datagram, MessageType, decode } from "../protocol/protocol";
import { Signal } from "../utils/signal";
import { isEmoji, isURL } from "../utils/validators";

export class Client {

    messageReceived: Signal<[string, string, string], void> = null;
    private nickname: string;
    private host: string;
    private port: number;
    private hostConnection: string = '127.0.0.1'
    private portConnection: number = 3333;
    private udpClient: udp.Socket;
    private pendingEchoResolve: null | ((value: string | PromiseLike<string>) => void) = null;

    public constructor(nickname: string, host: string, port: number) {
        if (!nickname) throw new Error("Nickname é obrigatório.");
        if (!port) throw new Error("Port é obrigatório");

        this.nickname = nickname.trim();
        this.host = host;
        this.port = port;
        
        this.udpClient = udp.createSocket('udp4');
    }

    public async startConnection(hostConn: string, portConn: number): Promise<void> {
        if (!hostConn) throw new Error("Host para conexão é obrigatório.");
        if (!portConn) throw new Error("Port para conexão é obrigatório.");
        this.hostConnection = hostConn;
        this.portConnection = portConn;

        return new Promise<void>((resolve, reject) => {
            this.udpClient.once('listening', () => {
                console.log(`Host ${this.nickname} Running on port ${this.port}`);
                resolve();
            });

            this.udpClient.on('message', (msgStream, rinfo) => {
                const decoded = decode(msgStream, rinfo);
                if (!decoded)
                    return;

                const { clientDatas, dgram } = decoded;

                if (dgram.messageType === MessageType.ECHO) {
                    const resolve = this.pendingEchoResolve;
                    this.pendingEchoResolve = null;
                    resolve?.(dgram.message);
                    return;
                }

                this.messageReceived?.([MessageType[dgram.messageType], clientDatas?.nickname ?? "user", dgram.message]);
            });

            this.udpClient.once('error', reject);
            this.udpClient.bind(this.port, this.host); // Configura porta e endereço
        })
    }

    public close(): void {
        this.udpClient?.close();
    }

    public async sendDefault(message: string): Promise<void> {
        const datagram: Datagram = {
            messageType: MessageType.DEFAULT,
            nickSize: this.nickname.length,
            nickname: this.nickname,
            messageSize: message.length,
            message
        };

        const dgramBuffer = encode({
            nickname: this.nickname,
            host: this.host,
            port: this.port
        }, datagram);

        this.udpClient.send(dgramBuffer, this.portConnection, this.hostConnection);
    }

    public async sendEmoji(message: string): Promise<void> {
        if (!isEmoji(message))
            throw new Error("Mensagem deve ser um emoji.");

        const datagram: Datagram = {
            messageType: MessageType.EMOJI,
            nickSize: this.nickname.length,
            nickname: this.nickname,
            messageSize: message.length,
            message
        };

        const dgramBuffer = encode({
            nickname: this.nickname,
            host: this.host,
            port: this.port
        }, datagram);

        this.udpClient.send(dgramBuffer, this.portConnection, this.hostConnection);
    }

    public async sendURL(url: string): Promise<void> {
        if (!isURL(url))
            throw new Error("URL inválida.");

        const datagram: Datagram = {
            messageType: MessageType.URL,
            nickSize: this.nickname.length,
            nickname: this.nickname,
            messageSize: url.length,
            message: url
        };

        const dgramBuffer = encode({
            nickname: this.nickname,
            host: this.host,
            port: this.port
        }, datagram);

        this.udpClient.send(dgramBuffer, this.portConnection, this.hostConnection);
    }

    public async sendEcho(message: string): Promise<string> {
        const datagram: Datagram = {
            messageType: MessageType.ECHO,
            nickSize: this.nickname.length,
            nickname: this.nickname,
            messageSize: message.length,
            message
        };

        const dgramBuffer = encode({
            nickname: this.nickname,
            host: this.host,
            port: this.port
        }, datagram);

        return new Promise<string>((resolve, reject) => {
            this.udpClient.send(dgramBuffer, this.portConnection, this.hostConnection, (err, lenght) => {
                if (err) reject(err);
            });

            this.pendingEchoResolve = resolve;
        });
    }
}