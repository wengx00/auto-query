import { pushConfig } from "./pusher/entry"
import { creeper, queryRef } from "./query/creeper"

pushConfig.appToken = 'xxxxxx' // 推送的Token
pushConfig.summary = '2023-2024学年上学期期末成绩更新' // 推送标题
pushConfig.topicIds = [10657] // TopicIds

queryRef.current = {
    year: 2023,
    term: 3 /* 3 上学期 12 下学期 */
} // 查询条件
queryRef.threshold = 180 // 查询间隔 180s

creeper({
    account: '20212131xxx',
    password: 'xxxxxx'
}) // 账号密码