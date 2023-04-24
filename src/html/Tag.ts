export function createTag(label: string, target: string): string {
    return `<a class="tag" href="/bzz/${target}">#${label}</a>`
}
