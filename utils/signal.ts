/*
    Esse tipo imita a funcionalidade existente no GDSCript da Godot.
    Basicamente é uma definição de um atributo para chamar funções.
    Um objeto define esse atributo e, dentro da sua funcionalidade,
    o chama quando estiver preenchido (chamamos isso de emitir um sinal quando algo acontecer).
    Outros objetos 'assina' esse atributro passando uma função.
    É uma forma do padrão de design OBSERVER. Aqui está limitado, pois o atributo aceita apenas
    uma assinatura por vez.
*/
export type Signal<Args extends unknown[]> = ((...args: Args[]) => void) | null;