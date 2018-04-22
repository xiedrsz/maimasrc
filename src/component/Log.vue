<template>
  <ul>
    <li>
      <p>日志</p>
      <textarea ref="log" rows="5" cols="40" v-model='log' type="text" readonly />
    </li>
  </ul>
</template>
<script>
  export default {
    name: 'log',
    props: {
      log: {
        type: String,
        default: ''
      }
    },
    methods: {
      toBottom () {
        this.$nextTick(() => {
          let scrollHeight = this.$refs.log.scrollHeight
          this.$refs.log.scrollTop = scrollHeight
        })
      }
    }
  }
</script>