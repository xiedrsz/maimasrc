<template>
  <ul>
    <li>
      <span>服务器1</span>
      <input v-model='server1' type="text" />
    </li>
    <li>
      <span>服务器2</span>
      <input v-model='server2' type="text" />
    </li>
    <li>
      当前服务器是： {{server}}
      <span><button @click="refresh">刷新</button></span>
      <span><button @click="switchover">切换</button></span>
    </li>
  </ul>
</template>
<script>
  const SERVER = localStorage.getItem('server') || ''
  const SERVER1 = localStorage.getItem('server1') || ''
  const SERVER2 = localStorage.getItem('server2') || ''
  export default {
    name: 'serverurl',
    props: {
      value: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        server1: SERVER1,
        server2: SERVER2,
        server: SERVER || SERVER1 || SERVER2
      }
    },
    watch: {
      server (val, old) {
        this.$emit('input', val)
      }
    },
    methods: {
      // 切换
      switchover () {
        let server1 = this.server1 = this.server1.replace('/app.html', '')
        let server2 = this.server2 = this.server2.replace('/app.html', '')
        let server = this.server
        if (server1 && server2) {
          this.server = server === server1 ? server2 : server1
        } else {
          this.server = server1 || server2
        }
        localStorage.setItem('server1', server1)
        localStorage.setItem('server2', server2)
        localStorage.setItem('server', this.server)
      },
      // 刷新
      refresh () {
        let server = this.server
        let self = this
        let timer
        if (!server) {
          this.switchover()
          return
        }
        this.server = ''
        timer = setTimeout(() => {
          this.server = server
          clearTimeout(timer)
        }, 0)
      }
    }
  }
</script>