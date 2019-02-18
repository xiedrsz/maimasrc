<!--卖码系统-->
<template>
  <div>
    <ul>
      <li>
        <button @click="buy()">买码</button>
        <button @click="clearUp">清空</button>
        <button @click="clear">清除</button>
        <button @click="recognition">AI识别</button>
      </li>
    </ul>
  </div>
</template>

<script>
  import recognition from '../libs/recognition'
  import Parser from '../libs/Parser'
  import {sleep, clearUp, record, batchBet} from '../libs/utils'

  export default {
    name: 'sell',
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
      // 清除
      clear () {
        this.$emit('output', {
          no: ''
        })
      },
      // 买码
      buy (nosrc) {
        let no = nosrc === undefined ? this.no : nosrc
        new Parser(no)
          .then(async (res) => {
            this.$emit('output', {
              no: ''
            })
            let server = localStorage.getItem('server') || ''
            let log = await batchBet(server, res)
            log += `原输入为:\n${no}\n`
            this.$emit('output', {
              log
            })
            // 下马失败
            if (!/本次共买/.test(log)) {
              return
            }
            // 刷新
            this.em.server.refresh()
            sleep(800).then(() => {
              this.$emit('output', {
                show: false
              })
            })
            sleep(9000).then(() => {
              this.$emit('output', {
                show: true
              })
            })
            // 统计
            let {nume, nums, numd} = record(res)
            let numeLoc = +localStorage.getItem('nume') || 0
            let numsLoc = +localStorage.getItem('nums') || 0
            let numdLoc = +localStorage.getItem('numd') || 0
            this.$emit('output', {
              nume: nume + numeLoc,
              nums: nums + numsLoc,
              numd: numd + numdLoc,
            })
          })
          .catch((err) => {
            this.$emit('output', {
              log: err
            })
          })
      },
      // AI识别
      recognition () {
        let no = this.no
        this.$emit('output', {
          no: recognition(no),
          log: `原文本：\n${no}\n`
        })
      },
      // 清空
      clearUp () {
        let server = localStorage.getItem('server') || ''
        clearUp(server).then(() => {
          this.$emit('output', {
            log: '已清空'
          })
        })
      }
    }
  }
</script>
