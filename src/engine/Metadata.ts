import { Strings, Types } from 'cafe-utility'

export function getTagsOrCategories(value: any): string[] {
    if (Array.isArray(value)) {
        return value.map(x => Strings.capitalize(Types.asString(x)))
    }
    if (Types.isString(value)) {
        return [Strings.capitalize(value)]
    }
    return []
}
