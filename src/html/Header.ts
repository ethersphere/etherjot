import { Objects, Strings } from 'cafe-utility'
import { GlobalState } from '../engine/GlobalState'
import { createLogoSvg } from './LogoSvg'
import { createNav } from './Nav'

export function createHeader(globalState: GlobalState, depth: number, active: string, variant = 'h1') {
    const title = Objects.getFirstDeep(globalState.configuration as any, ['header.title', 'title'])
    const description = Objects.getDeep(globalState.configuration as any, 'header.description')
    const link = Objects.getDeep(globalState.configuration as any, 'header.link')
    const descriptionHtml = description ? `<p class="blog-description">${description}</p>` : ''
    const linkHtml = link
        ? `
        <div class="blog-link">
            ${Strings.resolveMarkdownLinks(
                link as string,
                (label, link) => `<a href="${link}" target="_blank">${label}</a>`
            )}
        </div>`
        : ''

    return `
    <header>
        <div class="content-area">
            <div class="header-top-row">
                <div class="blog-name-row">
                    ${createLogoSvg()}
                    <${variant} class="blog-name">${title}</${variant}>
                </div>
                ${linkHtml}
            </div>
            ${descriptionHtml}
            ${createNav(globalState, depth, active)}
        </div>
    </header>`
}
