import { IncomingMessage, IncomingHttpHeaders } from 'http'
import https, { RequestOptions } from 'https'
import { fakeHeaders } from './config'
import * as zlib from 'zlib'

export const request = (options?: RequestOptions, data?: string) => new Promise<Response>((resolve, reject) => {
    const req = https.request({
        host: `sso.scnu.edu.cn`,
        path: `/AccountService/user`,
        port: 443,
        auth: 'sso.scnu.edu.cn',
        method: 'GET',
        ...options,
        headers: {
            ...fakeHeaders({ length: data?.length ?? undefined }),
            ...options?.headers,
            'Accept-Encoding': 'gzip, deflate',
        }
    }, (res) => {
        let data: any[] = []
        res.on('data', chunk => data.push(chunk))
        res.on('end', () => resolve(response(res, data)))
        res.on('close', () => resolve(response(res, data)))
    })
    req.on('error', e => reject(e))
    req.end(data)
})

export interface Response {
    getHeaders(): IncomingHttpHeaders,
    json(): any,
    text(): string,
    buffer(): Buffer,
    getHeader(name: string): string | string[] | undefined,
    getStatus(): { code?: number, msg?: string }
}
const decodeGzip = (origin: string | Buffer) => {
    return zlib.gunzipSync(origin)
}
const response = (res: IncomingMessage, data: any[]): Response => {
    let parsedData = Buffer.concat(data)
    if (res.headers['content-encoding']?.includes('gzip')) parsedData = decodeGzip(parsedData)
    return {
        getHeader(name: string) {
            return res.headers[name.toLowerCase()]
        },
        getHeaders() {
            return res.headers
        },
        text() {
            return parsedData.toString()
        },
        buffer() {
            return parsedData
        },
        json() {
            return JSON.parse(parsedData.toString())
        },
        getStatus() {
            return {
                code: res.statusCode,
                msg: res.statusMessage,
            }
        }
    }
}