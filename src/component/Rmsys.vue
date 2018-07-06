<!--风险控制-->
<template>
  <div>
    <ul>
      <li>
        <!--<button @click="analyze">赢率分析</button>-->
        <button @click="maxLimit">限额</button>
        <button @click="execute">决策</button>
      </li>
    </ul>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Parser from '../libs/Parser'
  import Record from '../libs/Record'
  import Profit from '../libs/Profit'
  import Reg from '../libs/Reg'
  import {analyze, limit, overview, filterTime, filterNull, soonselect, limitOne} from '../libs/utils'
  
  // 字符串转对象 9999=99
  function toObj (str) {
    let result = str.split(',').map(item => {
      return item.split('=')
    })
    result = _.fromPairs(result)
    delete result['']
    return result
  }
  
  // 对象转字符串
  function toStr (obj) {
    return _.toPairs(obj).filter(([no, money]) => money > 0).map(([no, money]) => `${no}=${money}`).join(',')
  }
  
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
        // Todo
        // let no = this.no
        let no = this.no
        let record = localStorage.getItem('chiRecord') || '{}'
        let buhui = ''
        let result, num1, num2
        no = no.split(/\,|\s/)
        let quota = no[0]
        let endTime = no[1]
        record = JSON.parse(record)
        num1 = overview(record)
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
        console.log(record)
        // 补回
        num2 = overview(record)
        buhui = _.mergeWith(num1, num2, (old, src) => {
          return old - src
        })
        buhui = _.pickBy(buhui, value => value)
        buhui = _.map(_.toPairs(buhui), ([n, m]) => `${n}=${m}`).join(',')
        buhui = `要补回号码如下：${buhui}\n`
        // 盈利分析
        result = analyze(record)
        buhui += '为降低风险建议买下如下号码: \n' + result.replace(/^[\s\S]*为降低风险建议买下如下号码\s/, '')
        this.$emit('output', {
          log: result,
          no: buhui
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
      // 决策
      execute () {
        let record = localStorage.getItem('chiRecord') || '{}'
        record = JSON.parse(record)
        let {flag, total, max, cover, wrate, back} = new Profit(record).execute()
        let mess = `本次一共收入 ${total} 元\n中奖概率为 ${cover}%\n盈利概率为 ${wrate}%\n最大赔付金额为 ${max}元\n`
        mess += flag ? '本次风险较低，吃了' : '本次风险较高，不吃'
        let no = back = back.join(',')
        let remain = localStorage.getItem('remain') || '='
        if (!/^([\dX]{4}=\d+\,?)+$/.test(back)) {
          return
        }
        // 新打回
        back = toObj(back)
        no = toObj(no)
        // 旧打回
        remain = toObj(remain)
        // 比较
        _.mergeWith(no, remain, (obj, src) => obj - src)
        no = toStr(no)
        if (no) {
          // 打回
          this.em.sell.buy(no)
          // 记录
          _.mergeWith(remain, back, (obj, src) => obj > src ? obj : src)
          remain = toStr(remain)
          localStorage.setItem('remain', remain)          
          this.$emit('output', {
            no: mess
          })
        } else {
          this.$emit('output', {
            no: mess,
            log: '没有要打回的号码'
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
      }
    }
  }
</script>
