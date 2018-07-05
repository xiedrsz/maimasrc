<template>
  <div id="app">
    <website :server="server" />
    <div class="tool-box">
      <button @click="show = !show" class="big-btn">{{show ? '收起' : '展开'}}</button>
      <div v-show="show">
        <server-url ref="server" v-model="server" />
        <recording :no="no" :nume="nume" :nums="nums" :numd="numd" @output="update" @clear="clear"/>
        <Log ref="log" :log="log" />
        <ul>
          <li>
            <textarea ref="textarea" @blur="toTop" rows="5" cols="40" v-model='no' type="text" placeholder="格式：123.456X789=16" />
          </li>
        </ul>
        <sell ref="sell" :no="no" :em="$refs" @output="update" />
        <chargeback :no="no" :em="$refs" @output="update" @clear="clear"/>
        <rmsys :no="no" :em="$refs" @output="update" />
      </div>
    </div>
  </div>
</template>

<script>
  import _ from 'lodash'
  import { Website, ServerUrl, Log, Recording, Chargeback, Rmsys, Sell } from './component'
  const NUME = +localStorage.getItem('nume') || 0
  const NUMS = +localStorage.getItem('nums') || 0
  const NUMD = +localStorage.getItem('numd') || 0
  /*import Record from './libs/Record'
  new Record()
    .limitOne()
    .filterNull()
    .lottery('5503')*/
  
  export default {
    name: 'app',
    data () {
      return {
        server: '',
        show: true,
        no: '',
        log: '',
        nume: NUME,
        nums: NUMS,
        numd: NUMD
      }
    },
    watch: {
      nume (val, old) {
        localStorage.setItem('nume', val)
      },
      nums (val, old) {
        localStorage.setItem('nums', val)
      },
      numd (val, old) {
        localStorage.setItem('numd', val)
      },
      server (val, old) {
        console.log(val)
      }
    },
    components: {
      Website, ServerUrl, Log, Recording, Chargeback, Rmsys, Sell
    },
    mounted () {
      this.$refs.textarea.focus()
      this.$refs.server.refresh()
    },
    methods: {
      // 输入框滚到顶部
      toTop () {
        this.$refs.textarea.scrollTop = 0
      },
      // 清除二三四字统计记录
      clear (type) {
        type && (this[type] = 0)
      },
      // 更新数据
      update (mess) {
        _.forEach(_.keys(mess), key => {
          this[key] !== undefined && (this[key] = mess[key])
        })
      }
    }
  }
</script>
