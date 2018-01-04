import Vue from 'vue'
import App from './App.vue'

Vue.filter('uppercase', function (val) {
  val = val.toString();
  val = val.toUpperCase()
  return val;
});

new Vue({
  el: '#app',
  render: h => h(App)
})