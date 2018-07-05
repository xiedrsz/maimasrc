<!--记录系统-->
<template>
  <div>
    <ul>
      <li>
        <button @click="saveStorage">修改记录</button>
        <button @click="setStorage">更换记录</button>
        <button @click="removeStorage">清理缓存</button>
        <button @click="getStorage">卖码记录</button>
      </li>
    </ul>
    <ul>
      <li>
        <button @click="overview">吃码概览</button>
        <button @click="readRecord">吃码记录</button>
        <!--<button @click="dontEat">不吃号码</button>-->
        <button @click="lottery">中奖明细</button>
        <button @click="tongJi">统计分析</button>
      </li>
    </ul>
    <ul>
      <li>
        <span>类型</span>
        <span>已吃数量</span>
        <span>已吃金额</span>
        <span>未吃数量</span>
      </li>
      <li>
        <span>二字：</span>
        <span>{{erN}}</span>
        <span>{{erM}}</span>
        <span>{{nume}}</span>
        <span><button @click="clear('nume')">清</button></span>
      </li>
      <li>
        <span>头尾：</span>
        <span>{{twN}}</span>
        <span>{{twM}}</span>
      </li>
      <li>
        <span>三字：</span>
        <span>{{saN}}</span>
        <span>{{saM}}</span>
        <span>{{nums}}</span>
        <span><button @click="clear('nums')">清</button></span>
      </li>
      <li>
        <span>四字：</span>
        <span>{{siN}}</span>
        <span>{{siM}}</span>
        <span>{{numd}}</span>
        <span><button @click="clear('numd')">清</button></span>
      </li>
      <li>
        <span>中奖概率：</span>
        <span>{{cover}}%</span>
      </li>
      <li>
        <span>盈利概率：</span>
        <span>{{wrate}}%</span>
      </li>
      <li>
        <span>吃码建议：</span>
        <span :class="{'red': !flag}">{{flag ? '可吃' : '不吃'}}</span>
      </li>
    </ul>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Profit from '../libs/Profit'
  import Reg from '../libs/Reg'
  import {lottery, overview, limit, filterTime, filterNull, limitOne} from '../libs/utils'
  
  export default {
    name: 'recording',
    props: {
      no: {
        type: String,
        default: ''
      },
      nume: {
        type: Number,
        default: 0
      },
      nums: {
        type: Number,
        default: 0
      },
      numd: {
        type: Number,
        default: 0
      }
    },
    data () {
      return {
        flag: true,
        cover: 0,
        wrate: 0,
        erN: 0,
        twN: 0,
        saN: 0,
        siN: 0,
        erM: 0,
        twM: 0,
        saM: 0,
        siM: 0
      }
    },
    methods: {
      // 修改记录
      saveStorage () {
        let no = this.no
        let chiRecord = localStorage.getItem('chiRecord') || '{}'
        if (no) {
          no = JSON.parse(no)
          chiRecord = JSON.parse(chiRecord)
          _.assign(chiRecord, no)
          chiRecord = JSON.stringify(chiRecord)
          localStorage.setItem('chiRecord', chiRecord)
          this.$emit('output', {
            no: '',
            log: '修改成功'
          })
        }
      },
      // 更换记录
      setStorage () {
        let no = this.no
        if (no) {
          no = JSON.parse(no)
          no = JSON.stringify(no)
          localStorage.setItem('chiRecord', no)
          this.$emit('output', {
            no: '',
            log: '设置成功'
          })
        }
      },
      // 卖码记录
      getStorage () {
        let result = localStorage.getItem('maRecord')
        this.$emit('output', {
          no: result
        })
      },
      // 清理缓存
      removeStorage () {
        localStorage.removeItem('maRecord')
        localStorage.removeItem('tuimaid')
        localStorage.removeItem('chiRecord')
        localStorage.removeItem('toBuy')
        localStorage.removeItem('dontChi')
        localStorage.removeItem('nume')
        localStorage.removeItem('nums')
        localStorage.removeItem('numd')
        localStorage.removeItem('youLiao')
        localStorage.removeItem('remain')
        localStorage.removeItem('maxLoss')
        this.$emit('output', {
          log: '缓存已全部删除'
        })
      },
      // 吃码概览
      overview () {
        let no = this.no
        let chiRecord = localStorage.getItem('chiRecord')
        let total
        // 空
        chiRecord = JSON.parse(chiRecord)
        if (!chiRecord) {
          this.$emit('output', {
            log: '吃码记录为空'
          })
          return
        }
        // 过滤
        if (no) {
          if (/二字?/.test(no)) {
            no = /^(\d*\X\d*){2}$/
          } else if (/三字?/.test(no)) {
            no = /^\d*\X\d*$/
          } else if (/四字?/.test(no)) {
            no = /^\d{4}$/
          } else {
            no = no.toUpperCase().split(/\,|\s/).join('|')
            no = new RegExp(no)
          }
          chiRecord = _.pickBy(chiRecord, (val, key) => no.test(key))
        }
        // 统计
        chiRecord = overview(chiRecord)
        total = _.sum(_.values(chiRecord))
        // 转换
        chiRecord = _.toPairs(chiRecord).sort((a, b) => b[1] - a[1])
        chiRecord = _.map(chiRecord, ([n, m]) => `${n}=${m}`)
        chiRecord = chiRecord.join(',')
        this.$emit('output', {
          no: chiRecord,
          log: `共${total}元`
        })
      },
      // 吃码记录
      readRecord () {
        let no = this.no
        let result = localStorage.getItem('chiRecord')
        if (!result) {
          this.$emit('output', {
            log: '吃码记录为空'
          })
          return
        }
        if (no) {
          no = no.toUpperCase()
          result = JSON.parse(result)
          no = no.split(/\,|\s/)
          result = _.pick(result, no)
          result = JSON.stringify(result)
        }
        this.$emit('output', {
          no: result
        })
      },
      // Todo，不吃号码，少用，暂时屏蔽
      dontEat () {
        let dontChi = localStorage.getItem('dontChi') || '[]'
        dontChi = JSON.parse(dontChi)
        dontChi = dontChi.join(',')
        this.$emit('output', {
          log: `不可再吃号码如下：\n${dontChi}\n`
        })
      },
      // 统计数据
      tongJi () {
        let record = localStorage.getItem('chiRecord') || '{}'
        record = JSON.parse(record)
        let profit = new Profit(record)
        // 决策
        this.flag = profit.decision()
        // 中奖概率
        this.cover = profit.coverage()
        // 盈利概率
        this.wrate = profit.win()
        // 吃码金额
        this.erM = profit.eatMoney(key => Reg.erzift.test(key))
        this.twM = profit.eatMoney(key => Reg.touwei.test(key))
        this.saM = profit.eatMoney(key => Reg.sanzi.test(key))
        this.siM = profit.eatMoney(key => Reg.sizi.test(key))
        // 吃码数量
        this.erN = profit.nos(key => Reg.erzift.test(key))
        this.twN = profit.nos(key => Reg.touwei.test(key))
        this.saN = profit.nos(key => Reg.sanzi.test(key))
        this.siN = profit.nos(key => Reg.sizi.test(key))
      },
      // 中奖明细
      lottery () {
        let no = this.no
        let record = localStorage.getItem('chiRecord') || '{}'
        let log = ''
        no = no.split(/\,|\s/)
        let lotteryNo = no[0]
        let quota = no[1]
        let endTime = no[2]
        record = JSON.parse(record)
        // 时间上限
        if (/\d{2}\:\d{2}(\:\d{2})?/.test(endTime)) {
          record = filterTime(record, endTime)
        }
        // 限额控制
        if (/\d+/.test(quota)) {
          record = limit(record, +quota)
        }
        // 除空
        record = filterNull(record)
        // 单次限额
        record = limitOne(record)
        // 中奖明细
        log += '中奖明细如下：\n'
        log += lottery(record, lotteryNo)
        this.$emit('output', {
          log
        })
      },
      // 清
      clear (type) {
        this.$emit('clear', type)
      }
    }
  }
</script>
