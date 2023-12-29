import { ContentType } from "../request/encode"
import { request } from "../request/request"
import { Pusher } from "./interface"

export const pushConfig = {
    appToken: 'needToBeOverride',
    summary: '期末成绩更新',
    topicIds: [] as number[],
}

export const push = async (content: string) => {
    const pushData: Pusher = {
        appToken: pushConfig.appToken,
        content,
        summary: pushConfig.summary,
        contentType: 3,
        topicIds: pushConfig.topicIds,
        verifyPay: false,
        uids: [],
        url: ''
    }
    try {
        const { json } = await request({
            method: 'POST',
            headers: {
                'Content-Type': ContentType.json,
            },
            host: 'wxpusher.zjiecode.com',
            path: '/api/send/message'
        }, JSON.stringify(pushData))
        console.log(json())
    } catch (error) {
        console.error('推送时出错', error)
    }
}