import Vue from 'vue'
import 'babel-polyfill'
import App from './App.vue'
import './assets/app.scss'

Vue.filter('uppercase', function (val) {
  val = val.toString();
  val = val.toUpperCase()
  return val;
});

new Vue({
  el: '#app',
  render: h => h(App)
})