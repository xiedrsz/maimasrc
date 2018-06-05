<!--退码系统-->
<template>
  <div>
    <ul>
      <li>
        <button @click="getDetail">下注明细</button>
        <button @click="chiMa">吃码分析</button>
        <button @click="tuiMa">退码</button>
      </li>
    </ul>
  </div>
</template>

<script>
  import _ from 'lodash'
  import {detailUrl, chiMa, tuiMa, sleep, soonselect} from '../libs/utils'
  
  export default {
    name: 'chargeback',
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
      // 下注明细，生成请求链接
      getDetail () {
        let no = this.no
        let server = localStorage.getItem('server') || ''
        no = `_${no}`
        if (detailUrl[no]) {
          server += detailUrl[no]
          this.$emit('output', {
            log: server
          })
          window.open(server)
        }
      },
      // 吃码
      chiMa () {
        let result = this.no
        let type
        if (!result) {
          return
        }
        type = chiMa(result)
        this.$emit('output', {
          no: '',
          log: '本页分析完毕'
        })
        this.$emit('clear', type)
      },
      // 退码
      async tuiMa () {
        console.log(this.em.server)
        let server = localStorage.getItem('server') || ''
        let toBuy = localStorage.getItem('toBuy') || '[]'
        let tuimaid = localStorage.getItem('tuimaid')
        let selectnumbertotal_hidden
        let post_number_money
        let log
        if (!tuimaid) {
          this.$emit('output', {
            log: '没有要退号码'
          })
          return
        }
        toBuy = JSON.parse(toBuy)
        selectnumbertotal_hidden = toBuy.length
        // 正确做法应该是先买后退，由于经常遇到退码不成功，因此尝试掉下顺序
        // [1] 退码
        await tuiMa(tuimaid, server).then((list) => {
          let len = list.length
          list = _.map(list, ({dt, m, n}) => `${dt}:${n}=${m}`)
          list = list.join('\n')
          log = `本次应退码的id如下： \n${tuimaid}\n详情如下： \n${list}\n共${len}组\n`
        })
        // [2] 补码
        if (selectnumbertotal_hidden) {
          await sleep(1000)
          post_number_money = _.map(toBuy, ({n, m}) => `${n}|${m}`).join(',')
          log += `本次应补上号码有\n${post_number_money.replace(/\|/g, '=')}\n`
          await soonselect({
            post_number_money,
            selectnumbertotal_hidden
          }, server)
          localStorage.removeItem('toBuy')
          sleep(2000).then(() => {
            this.em.server.refresh()
            this.$emit('output', {
              show: false
            })
          })
          sleep(4000).then(() => {
            this.$emit('output', {
              show: true
            })
          })
        }
        // 审阅
        this.$emit('output', {
          log
        })
        this.em.log.toBottom()
      }
    }
  }
</script>
