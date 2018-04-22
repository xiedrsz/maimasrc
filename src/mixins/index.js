import { singleKX, sleep } from '../libs/utils'

// 总码个数
let totalNo = 0
// 总金额数
let totalMoney = 0

const mixin = {
  methods: {
    // 发送多个快选
    async multiKX(reqList) {
      let {speed, server, no} = this
      let result
      totalNo = 0
      totalMoney = 0
      this.log = `原输入：\n${no}\n\n`
      this.no = ''
      for (let form of reqList) {
        result = await singleKX(form, server)
        totalNo += result.totalNo
        totalMoney += result.totalMoney
        this.log += result.log
        // 等待，避免请求频繁
        await sleep(speed)
      }
      this.log += `共${totalNo}笔，${totalMoney}元\n`
      this.$refs.server.refresh()
      sleep(800).then(() => {
        this.show = false
      })
      sleep(9000).then(() => {
        this.show = true
      })
    },
    // 更新日志
    updateLog (log, append) {
      append ? (this.log += log) : (this.log = log)
    }
  }
}

export default mixin
