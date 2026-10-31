// Objeto Regex para validar se é um emoji
const EMOJI_ONLY = /^\p{RGI_Emoji}+$/v;

export function isEmoji(text: string): boolean {
    return EMOJI_ONLY.test(text);
}

export function isURL(url: string): boolean {
    if (!URL.parse(url))
        return false;

    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
}