import { articleFontData } from '../data/ArticleFont'
import { brandingFontData } from '../data/BrandingFont'
import { menuFontData } from '../data/MenuFont'

export function createNormalFontData() {
    return Buffer.from(menuFontData, 'base64')
}

export function createBrandingFontData() {
    return Buffer.from(brandingFontData, 'base64')
}

export function createArticleFontData() {
    return Buffer.from(articleFontData, 'base64')
}
