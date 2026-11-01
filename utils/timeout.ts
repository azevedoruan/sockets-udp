
// Função que aguarda o resultado de um promise dentro de um tempo limite.
// Caso o tempo estoure, é lançado o erro definido no parâmtro.
export function withTimeout<T>(promise: Promise<T>, ms: number, error: Error): Promise<T> {

    // Promise auxiliar que executará o timeout.
    const timeout = new Promise<never>((_, reject) => {

        // setTimeout() chama um callback quando o tempo encerrar.
        // Nosso callback é a rejeição da promise auxiliar com o erro do parâmetro.
        setTimeout(() => reject(error), ms);
    });

    // Promise.race é uma promise que termina com o resultado de outra promise.
    // Você passa várias promises, a que for resolvida ou rejeitada primeiro, definirá o resultado
    // da Promise.race.
    return Promise.race([promise, timeout]);
}