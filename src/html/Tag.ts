export function createTag(label: string, slug: string, depth: number): string {
    return `<a class="tag" href="${'../'.repeat(depth)}${slug}">#${label}</a>`
}
