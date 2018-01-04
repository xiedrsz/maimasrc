<template>
  <div id="app">
    <iframe ref="iframe" class="iframe" frameborder="0" marginwidth="0" marginheight="0" scrolling="yes" src=""></iframe>

    <div class="tool-box">
      <button @click="show=!show">{{show?'收起':'展开'}}</button>
      <div v-show="show">
        <ul>
          <li>
            <span>服务器</span>
            <input v-model='server' type="text" />
          </li>
          <li>
            <button @click="refresh">刷新</button>
          </li>
        </ul>
        <ul>
          <li>
            <p>请求频率，若发现多个码只有第一个成功时，应将以下频率调高点</p>
            <input v-model='speed' type="number" />
          </li>
        </ul>
        <ul>
          <li>
            <textarea rows="3" cols="40" v-model='no' type="text" placeholder="格式：123.456X789=16" />
          </li>
          <li>
            <button @click="buy">买码</button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
  import 'babel-polyfill'
  import qs from 'qs'
  const SERVER = localStorage.getItem('server') || ''
  const suffix = {
    kk: [',|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,||,,,|0,0,0,0,|0,0,,,|0,0,||||0,0,|||0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||', '|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,||,,,|0,0,0,0,|0,0,,,|0,0,||0,0,||0,0,|0,0,||0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||', '|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,|,,|,,,||0,0,,,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||'],
    a: ['|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,||,,,|0,0,0,0,|0,0,,,|0,0,||||0,0,|||0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||', '|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,||,,,|0,0,0,0,|0,0,,,|0,0,||0,0,||0,0,|0,0,||0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||', '|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,|,,|,,,||0,0,,,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||']
  }

  export default {
    name: 'app',
    data() {
      return {
        server: SERVER,
        speed: 1000,
        show: true,
        no: ''
      }
    },
    created() {},
    methods: {
      // 刷新
      refresh() {
          let server = this.server
          if (!server) {
            alert('请输入服务器地址')
          }

          localStorage.setItem('server', server)
          this.$refs.iframe.src = `${server}/app.html`
        },
        // 买码
        buy() {
          let self = this
          let server = this.server
          let label = 'a'
          let no = this.no.toUpperCase()
          let nos = no.split(/[,|，]/)
          let i = 0
          let len = nos.length
          let number = ''
          let money = ''
          let preMoney = 1
          let numbers = ''
          if (/wk/.test(server)) {
            label = 'kk'
          }
          self.reqList = []
          nos.forEach(async item => {
            let result = ['']
            let newResult = []
            let items = ''

            // 请求信息
            let post_number_money = ''
            let post_money = ''
            let selectlogs = '0,1,'
            let selectlogsclassid = ''
            let selectnumbertotal_hidden = ''

            money = item.match(/=(\d+)$/)
            number = money ? money[0] : ''

            money = money ? money[1] : preMoney
            number = item.replace(number, '')

            numbers = number.match(/\d+|[X]|[全]/g)
            numbers.forEach(item => {
              item = item.replace('全', '0123456789')
              selectlogs += item + ','
              items = item.split('').sort()
              items.forEach(one => {
                result.forEach(temp => {
                  newResult.push(temp + one)
                })
              })
              result = newResult.slice(0)
              newResult = []
            })

            selectnumbertotal_hidden = result.length
            post_number_money = result.join(',')
            preMoney = post_money = +money
            selectlogsclassid = 3 - (selectlogs.match(/X/g) || []).length
            selectlogs = selectlogs.replace(/X/g, '')
            selectlogs += suffix[label][selectlogsclassid - 1]

            self.reqList.push({
              post_number_money,
              post_money,
              selectlogsclassid,
              selectnumbertotal_hidden,
              selectlogs
            })
          })
          this.ajax()
        },
        // 发送请求
        async ajax() {
          for (let form of this.reqList) {
            await this.kuaixuan(form)
          }
        },
        // 快选
        kuaixuan(form) {
          let speed = this.speed
          return new Promise((resolve, reject) => {
            form.action = 'soonselectnumber'
            form.sizixian = '0'
            form.zjzc = '0'
            form.strarray = ''
            form.lujingstat = '3'
            let sform = qs.stringify(form)
            let url = this.server + '/appindexajax.php'
            let iframe = document.createElement("iframe")
            url += `?${sform}`
            iframe.src = url
            iframe.onload = (event) => {
              if (!event) {
                reject('ERROR')
              }
              console.log(`${form.post_number_money}: ${form.post_money}组`)
              document.body.removeChild(iframe)
              iframe.remove()
              let timer = setTimeout(() => {
                clearTimeout(timer)
                resolve('OK')
              }, speed)
            }
            document.body.appendChild(iframe)
          })
        }
    }
  }
</script>

<style lang="scss">
  html,
  body,
  #app {
    top: 0px;
    left: 0px;
    bottom: 0px;
    right: 0px;
    height: 100%;
    overflow: hidden;
    margin: 0;
    padding: 0px;
    border: 0px;
    position: relative;
    font-size: 12px;
    font-family: arial;
    min-width: 980px;
  }
  
  .iframe {
    height: 100%;
    width: 100%;
  }
  
  .tool-box {
    position: absolute;
    top: 0;
    left: 0;
    background: #FFFFFF;
  }
</style>