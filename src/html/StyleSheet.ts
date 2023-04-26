export function createStyleSheet(depth: number) {
    return `<link rel="stylesheet" href="${'../'.repeat(depth)}style.css" />`
}
