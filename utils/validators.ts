export function isURL(url: string): boolean {
    if (!URL.parse(url))
        return false;

    const { protocol } = new URL(url);
    return protocol === "http:" || protocol === "https:";
}