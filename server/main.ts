import { Server } from "./src/server";

function main() {
    const udpServer = new Server();
    udpServer.start("127.0.0.1", 3333);
}

main();