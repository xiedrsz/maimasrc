<!--风险控制-->
<template>
  <div>
    <ul>
      <li>
        <button @click="analyze">赢率分析</button>
        <button @click="maxLimit">限额</button>
        <button @click="bigNo">大额号码</button>
      </li>
    </ul>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Parser from '../libs/Parser'
  import Profit from '../libs/Profit'
  import Reg from '../libs/Reg'
  import {analyze, limit, overview, filterTime, filterNull, limitOne} from '../libs/utils'

  export default {
    name: 'rmsys',
    props: {
      no: {
        type: String,
        default: ''
      },
      em: {
        type: Object,
        default () {
          return {}
        }
      }
    },
    methods: {
      // 赢率分析
      analyze () {
        let no = this.no
        let force = '少吃' === no
        let record = localStorage.getItem('chiRecord') || '{}'
        record = JSON.parse(record)
        let profit = new Profit(record)
        let {flag, total, max, cover, wrate} = profit.execute(force)
				let log = `${force ? '本次执行强制少吃\n' : ''}总收入：${total}元\n中奖概率：${cover}%\n盈利概率：${wrate}%\n最大赔付金额：${max}元\n${flag ? '风险较低，可吃' : '风险较高，少吃'}`
        this.$emit('output', {
          log
        })
      },
      // 有料, Todo 没什么用，暂时屏蔽
      youLiao () {
        let no = this.no
        if (no) {
          new Parser(no)
            .then(res => {
              let you = localStorage.getItem('youLiao') || '[]'
              you = JSON.parse(you)
              _.forEach(res, n => {
                if (/\|0/.test(n)) {
                  // 删除
                  n = n.replace(/\|0/, '')
                  _.remove(you, no => no === n)
                } else {
                  // 新增
                  n = n.replace(/\|\d+/, '')
                  you.push(n)
                }
              })
              // 去重
              you = _.uniq(you)
              localStorage.setItem('youLiao', JSON.stringify(you))
              this.$emit('output', {
                no: '',
                log: `修改完成，以下号码较准，已被禁吃：\n${you}\n`
              })
            })
            .catch((err) => {
              this.$emit('output', {
                log: '输入有误'
              })
            })
        }
      },
      // 限额
      maxLimit () {
        let no = this.no
        let max
        let log
        if (!/^最大亏损限额为:\s?\d+元/.test(no)) {
          max = localStorage.getItem('maxLoss') || 12000
          log = `最大亏损限额为: ${max}元`
          this.$emit('output', {
            no: log
          })
        } else {
          max = no.match(/\d+/)
          localStorage.setItem('maxLoss', +max)
          this.$emit('output', {
            log: '设置成功'
          })
        }
      },
      // 大额号码
      bigNo () {
        let no = this.no || ''
        let record = localStorage.getItem('chiRecord') || '{}'
        record = JSON.parse(record)
        record = new Profit(record)
        if (/少吃/.test(no)) {
          record.little()
        }
        no = +no.match(/\d+/) || 50
        let result = record.bigAmount(no)
        result = result.join(' ')
        this.$emit('output', {
          log: result,
          no: result
        })
      }
    }
  }
</script>
