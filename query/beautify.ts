import { queryResultDict } from "./dict"
export const beautify = (data: {}[]) => {
    const header = `|${queryResultDict.map(item => item.label).join('|')}|`
    const div = `|${queryResultDict.map(_ => ':---:').join('|')}|`
    const content = `${data.map(item => '|' + Object.values(item).join('|') + '|').join('\n')}`
    return `${header}\n${div}\n${content}`
}