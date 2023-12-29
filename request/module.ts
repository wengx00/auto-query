import {StudentInfo} from './interface'
import {encoder} from './encode'
import {request} from './request'
export const query = {
    // 获取Cookie
    async getCookie(stuInfo: StudentInfo) {
        let host = 'sso.scnu.edu.cn'
        let path = '/AccountService/user/login.html'
        let cookie = ''
        const ssoLoginQuery = encoder.query.stringify({...stuInfo, rancode: ''}) // SSO登录表单
        let res = await request({
            path, host,
            method: 'POST'
        }, ssoLoginQuery) // 统一身份认证拿 Cookie
        if (res.getStatus().code !== 302) throw '密码错误'
        path = encoder.location.getPath(res.getHeader('location') as any)
        cookie = encoder.cookie.beautify(res.getHeader('set-cookie') as any)
        path = '/AccountService/openapi/onekeyapp.html?app_id=96' // 模拟点击跳转到教务系统
        res = await request({
            path, host,
            headers: {cookie}
        }) // 跳转到教务系统
        if (res.getStatus().code !== 302) throw '登录过期'
        host = encoder.location.getHost(res.getHeader('location') as any) // 教务系统的Host
        path = encoder.location.getPath(res.getHeader('location') as any) // 跳转教务系统登录认证
        res = await request({
            host, path,
            headers: {cookie}
        }) // 登录教务系统，拿取认证后的Cookie
        if (res.getStatus().code !== 302) throw '登录教务系统失败'
        // cookie = encoder.cookie.beautify([cookie, ...res.getHeader('set-cookie') as any])
        path = encoder.location.getPath(res.getHeader('location') as any) // 跟随redirect
        res = await request({
            host, path,
            headers: {cookie}
        })
        cookie = encoder.cookie.beautify([cookie, ...res.getHeader('set-cookie') as any])
        return cookie // 拿到了全部 Cookie
    },
    // 查询某一学年成绩
    async listGrade(stuInfo: StudentInfo, options: { cookie: string, year: number, term?: 3 | 12 }) {
        const {cookie, year, term} = options
        const requestData = {
            xnm: year,
            xqm: term ?? '',
            _search: false,
            nd: new Date().getTime(),
            'queryModel.showCount': 15,
            'queryModel.currentPage': 1,
            'queryModel.sortName': '',
            'queryModel.sortOrder': 'asc',
            time: 0
        } // 查询表单
        let host = 'jwxt.scnu.edu.cn'
        let path = `/cjcx/cjcx_cxXsgrcj.html?doType=query&gnmkdm=N305005&su=${stuInfo.account}`
        let res = await request({
            host, path,
            method: 'POST',
            headers: {cookie}
        }, encoder.query.stringify(requestData)) // 首次查询 可以获取一共有几页
        try {
            const firstQuery = res.json()
            const result: any[] = firstQuery.items // 查询结果
            const totalPage = firstQuery.totalPage ?? 1
            for (let time = 1; time < totalPage; ++time) {
                // 查到见底
                requestData['queryModel.currentPage'] += 1
                res = await request({
                    host, path,
                    method: 'POST',
                    headers: {cookie}
                }, encoder.query.stringify(requestData))
                result.push(...res.json().items)
            }
            return result
        } catch (e) {
            throw '查询时出错'
        }
    },
    // 查询某一科目成绩详情
    async getGradeDetail(stuInfo: StudentInfo, options: {year: number, term: 1 | 2, classId: string, subject: string, cookie: string}) {
        const {classId, year, term, subject, cookie} = options
        const path = `/cjcx/cjcx_cxCjxqGjh.html?time=${new Date().getTime()}&gnmkdm=N305005&su=${stuInfo.account}`
        const host = 'jwxt.scnu.edu.cn'
        const requestData = encoder.query.stringify({
            jxb_id: classId,
            xnm: year,
            xqm: term === 1 ? 3 : 12,
            kcmc: subject
        })
        let res = await request({
            host, path, method: 'POST',
            headers: { cookie }
        }, requestData)
        const origin = res.text()
        const label = origin.match(/\ [\u4e00-\u9fa5]+\ /g)?.map(item => item.trim())?.slice(4) // 获取成绩分布
        const detail = origin.match(/\d+%?\&nbsp\;/g)?.map(item => item.replace('&nbsp;', ''))
        const result: any = {}
        label?.forEach((name, index) => {
            result[name] = {
                percent: detail?.[index * 2],
                value: detail?.[index * 2 + 1]
            }
        })
        return result
    }
}