<!--风险控制-->
<template>
  <div>
    <ul>
      <li>
        <button @click="analyze">赢率分析</button>
        <button @click="dontEat">不吃号码</button>
        <button @click="youLiao">有料</button>
      </li>
    </ul>
  </div>
</template>

<script>
  import _ from 'lodash'
  import Parser from '../libs/Parser'
  import {analyze} from '../libs/utils'
  
  export default {
    name: 'rmsys',
    props: {
      no: {
        type: String,
        default: ''
      }
    },
    methods: {
      // 赢率分析
      analyze () {
        let record = localStorage.getItem('chiRecord') || '{}'
        let result
        record = JSON.parse(record)
        result = analyze(record)
        console.log(result)
        this.$emit('output', {
          log: result,
          no: result.replace(/^[\s\S]*为降低风险建议买下如下号码\s/, '')
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
      // 有料
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
      }
    }
  }
</script>
