import { push } from "../pusher/entry"
import { StudentInfo } from "../request/interface"
import { query } from "../request/module"
import { beautify } from "./beautify"
import { queryResultDict } from "./dict"

export type QueryConditions = {
    year: number
    term: 3 | 12
}

export const queryRef = {
    current: {
        year: 2023,
        term: 3
    } as QueryConditions,
    threshold: 180,
}

export const creeper = async (stuInfo: StudentInfo) => {
    const getCookie = () => query.getCookie(stuInfo)
    let cookie: string | null = null
    let preRes: any[] | null = null
    const getGrade = async () => {
        if (!cookie) {
            console.log('Cookie失效, 正在重新获取...')
            try {
                cookie = await getCookie()
            } catch (err) {
                console.error('可能是账号被锁定，1小时后重试')
                setTimeout(getGrade, 3600000)
                return
            }
        }
        console.log(`当前Cookie: ${cookie}`)
        let data: any[] | null = null
        try {
            data = await query.listGrade(stuInfo, {
                cookie,
                ...queryRef.current
            })
        } catch (error) {
            console.error('查询失败', error)
            cookie = null
            getGrade()
            return
        }
        const result = data.map(item =>
            queryResultDict.reduce((pre, cur) =>
                Object.assign(pre, { [cur.label]: item[cur.value] }), {}))
        console.log('当前查询成绩: ', result)
        if (!preRes || preRes.length !== result.length) {
            // 需要push
            console.log(`==查询到新成绩==`)
            push(beautify(result))
        }
        preRes = result
        setTimeout(getGrade, queryRef.threshold * 1000)
    }
    getGrade()
}