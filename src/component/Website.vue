<template>
  <iframe class="iframe" frameborder="0" marginwidth="0" marginheight="0" scrolling="yes" :src="url">
  </iframe>
</template>

<script>
  export default {
    name: 'website',
    props: {
      server: {
        type: String,
        default: ''
      }
    },
    computed: {
      url () {
        let server = this.server
        // return server ? `${server}/app.html` : ''
        return server ? server : ''
      }
    }
  }
</script>
