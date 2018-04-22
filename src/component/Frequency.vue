<template>
  <ul>
    <li>
      <button @click="getStorage">卖码记录</button>
      <button @click="removeStorage">清理缓存</button>
    </li>
  </ul>
</template>
<script>
  export default {
    name: 'frequency',
    methods: {
      // 卖码记录
      getStorage () {
        let result = localStorage.getItem('maRecord')
        this.$emit('out-put', result)
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
        this.$emit('out-put', '缓存已全部删除')
      }
    }
  }
</script>