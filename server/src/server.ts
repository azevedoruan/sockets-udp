import * as udp from "dgram";
import logger from "../../logger/logger";

 export class Server {

    private server: udp.Socket;

    public constructor() {
        this.server = udp.createSocket('udp4');
    }

    public start(host: string, port: number): void {
        const server = `${host}:${port}`; // Info do para log
        //this.server.bind(port, host); // Configura porta e endereço

        logger.info({ server }, "server running");

    }
 }