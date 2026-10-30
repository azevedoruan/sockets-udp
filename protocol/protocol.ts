export enum MessageType { SAIR = 0, DEFAULT = 1, EMOJI = 2, URL = 3, ECHO = 4 };

export const MAX_NICKSIZE = 64;

export type ClientDatas = {
    nickname: string,
    host: string,
    port: number
} | null;

/*
- Message Type    (1 byte)
- NickSize        (1 byte)
- Nickname        (1 a 64 bytes)
- MessageSize     (1 byte)
- Message         (MessageSize bytes)
*/
export type Datagram = {
    messageType: MessageType,
    nickSize: number,
    nickname: string,
    messageSize: number,
    message: string
}

export function decode(dgram: Buffer, origin?: { address: string, port: number }): { clientDatas: ClientDatas, dgram: Datagram } | null {
    if (dgram.length < 4)
        return null;

    const type = dgram.readUInt8(0);
    const nickSize = dgram.readUInt8(1);

    if (!(type in MessageType))
        return null;

    if (nickSize < 1 || nickSize > MAX_NICKSIZE)
        return null;

    const msgSizeOffset = 2 + nickSize;
    if (dgram.length < msgSizeOffset + 1) // Datagrama não tem tamanho suficiente para cobrir o size da mensagem
        return null;
    
    const msgSize = dgram.readUInt8(msgSizeOffset);
    const msgOffset = msgSizeOffset + 1
    if (dgram.length < msgSize + msgOffset) // Datagram não tem tamanho suficiente para cobrir a mensagem completa
        return null;
    
    const nickname = dgram.subarray(2, msgSizeOffset).toString('utf-8');
    const message = dgram.subarray(msgOffset, msgOffset + msgSize).toString('utf-8');

    return {
        clientDatas: {
            nickname,
            host: origin?.address ?? "",
            port: origin?.port ?? 0
        },
        dgram: {
            messageType: type,
            nickSize,
            nickname,
            messageSize: msgSize,
            message
        }
    }
}

export function encode(client: ClientDatas, dgram: Datagram): Buffer {
    if (!client || !client.nickname)
        throw new Error("Nickname é obrigatório.");

    if (!(dgram.messageType in MessageType))
        throw new Error("MessageType inválido.");

    const nickname = Buffer.from(client.nickname, 'utf-8');
    const message = Buffer.from(dgram.message ?? "", 'utf-8');

    if (nickname.length < 1 || nickname.length > MAX_NICKSIZE)
        throw new Error(`Nickname deve ter entre 1 e ${MAX_NICKSIZE} bytes.`);

    const nickOffset = 2;
    const msgSizeOffset = nickOffset + nickname.length;
    const msgOffset = msgSizeOffset + 1;

    const buffer = Buffer.alloc(msgOffset + message.length);

    buffer.writeUInt8(dgram.messageType, 0);            // Message Type
    buffer.writeUInt8(nickname.length, 1);              // NickSize
    nickname.copy(buffer, nickOffset);                  // Nickname
    buffer.writeUInt8(message.length, msgSizeOffset);   // MessageSize
    message.copy(buffer, msgOffset);                    // Message

    return buffer;
}