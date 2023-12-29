import cookie from 'cookie'

export const encoder = {
    cookie: {
        parse(origin: string[]) {
            let result = {} as Record<string, any>
            origin.forEach(item => result = Object.assign(result, cookie.parse(item)))
            return result
        },
        stringify(obj: Record<string, string>) {
            let result = ''
            Object.entries(obj).forEach(item => result += `${cookie.serialize(...item)};`)
            return result.slice(0, -1) // 去除末尾分号
        },
        beautify(origin: string[]) {
            return encoder.cookie.stringify(encoder.cookie.parse(origin))
        }
    },
    query: {
        stringify(obj: Record<string, any>) {
            let result = ''
            Object.entries(obj).forEach(item => result += `${item[0]}=${item[1]}&`)
            return result.slice(0, -1) // 去除末尾&
        }
    },
    location: {
        getPath(origin: string) {
            if (!origin.includes('//')) return origin
            let url = origin.split('//')[1]
            return url.slice(url.indexOf('/'))
        },
        getHost(origin: string) {
            if (!origin.includes('//')) return origin
            let url = origin.split('//')[1]
            return url.slice(0, url.indexOf('/'))
        }
    }
}
export const ContentType = {
    query: 'application/x-www-form-urlencoded',
    json: 'application/json; charset=utf-8',
}