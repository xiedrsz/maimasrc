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
  import {lottery} from '../libs/utils'
  
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
        this.$emit('output', {
          log: '缓存已全部删除'
        })
      },
      // 吃码概览
      overview () {
        let no = this.no
        let chiRecord = localStorage.getItem('chiRecord')
        let list, total
        if (!chiRecord) {
          this.$emit('output', {
            log: '吃码记录为空'
          })
          return
        }
        chiRecord = JSON.parse(chiRecord)
        if (no) {
          // 二字
          if (/二字?/.test(no)) {
            no = _.filter(_.keys(chiRecord), no => {
              let len = no.match(/X/g) || []
              len = len.length
              return len === 2
            })
          } else if (/三字?/.test(no)) {
            no = _.filter(_.keys(chiRecord), no => {
              let len = no.match(/X/g) || []
              len = len.length
              return len === 1
            })
          } else if (/四字?/.test(no)) {
            no = _.filter(_.keys(chiRecord), no => {
              let len = no.match(/X/g) || []
              len = len.length
              return len === 0
            })
          } else {
            no = no.toUpperCase()
            no = no.split(/\,|\s/)
          }
          chiRecord = _.pick(chiRecord, no)
        }
        list = _.map(_.keys(chiRecord), item => {
          let n = item
          let m = _.sum(_.map(chiRecord[item], ({m}) => +m))
          return {n, m}
        })
        list = _.sortBy(list, 'm')
        total = _.sum(_.map(list, ({m}) => +m))
        list = _.map(list, ({n, m}) => `${n}=${m}`)
        _.reverse(list)
        list = list.join(',')
        this.$emit('output', {
          no: list,
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
      // 中奖明细
      lottery () {
        let no = this.no
        let detail = localStorage.getItem('chiRecord') || '{}'
        let log = ''
        detail = JSON.parse(detail)
        detail = lottery(detail, no)
        if (detail) {
          log += '中奖明细如下：\n'
          _.forEach(detail, (value, key) => {
            value = _.map(value, ({dt, f, m}) => `${dt}: ${f}X${m}`)
            log += `${key}\n`
            log += value.join('\n') + '\n'
          })
          this.$emit('output', {
            log
          })
        }
      },
      // 清
      clear (type) {
        this.$emit('clear', type)
      }
    }
  }
</script>
