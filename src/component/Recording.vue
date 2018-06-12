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
        <button @click="dontEat">不吃号码</button>
        <button @click="lottery">中奖明细</button>
      </li>
    </ul>
    <ul>
      <li>
        <span>二字：</span>
        <span>{{nume}}</span>
        <span><button @click="clear('nume')">清</button></span>
      </li>
      <li>
        <span>三字：</span>
        <span>{{nums}}</span>
        <span><button @click="clear('nums')">清</button></span>
      </li>
      <li>
        <span>四字：</span>
        <span>{{numd}}</span>
        <span><button @click="clear('numd')">清</button></span>
      </li>
    </ul>
  </div>
</template>

<script>
  import _ from 'lodash'
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
      // 不吃号码
      dontEat () {
        let dontChi = localStorage.getItem('dontChi') || '[]'
        dontChi = JSON.parse(dontChi)
        dontChi = dontChi.join(',')
        this.$emit('output', {
          log: `不可再吃号码如下：\n${dontChi}\n`
        })
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
