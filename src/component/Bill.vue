<template>
  <div class="bill">
    <div ref="order" style="float: left; background: #FFFFFF;">
      <button @click="refresh" style="margin-left: 2px; font-size: 1.2em"> 设置图示 </button>
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-left: 2px;">
        <tbody>
          <tr>
            <td style="text-align:right;font-size:15px;">单位：元</td>
          </tr>
        </tbody>
      </table>
      <table align="center" width="190" cellpadding="0" cellspacing="0" class="tablebprint4" style="margin: 2px;">
        <tbody>
          <tr>
            <td colspan="3" class="print2" style="text-align:center;">
              <span style="color:red;font-size:18px;">七星彩</span>
              <span style="font-size:14px;">(第1次打印)</span>
            </td>
          </tr>
          <tr>
            <td colspan="3" class="print3">时间:<span id="_datetime">{{time}}</span>
              <br>会员:<span id="_user">{{member}}</span>
              <br>编号:<span id="_orderid">{{number}}</span></td>
          </tr>
          <tr class="print2">
            <td style="text-align:center;">号码</td>
            <td style="text-align:center;">赔率</td>
            <td style="text-align:center;">金额</td>
          </tr>
        </tbody>
        <tbody id="orderlist">
          <tr v-for="(item, index) in list" bgcolor="#ffffff" class="print2" style="height:28px;line-height:19px;">
            <td style="text-align:center;">
              <input class="input-no" type="text" v-model="item.no" />
            </td>
            <td style="text-align:center;">
              <input class="input-no" type="text" :value="'1:'+item.odds" />
            </td>
            <td style="text-align:center;">
              <input class="input-no" type="text" :value="item.money" />
            </td>
          </tr>
        </tbody>
        <tbody>
          <tr class="print5">
            <td colspan="3">笔数<span id="_bscount">{{count}}</span> 总金额<span id="_allmoney">{{sum}}</span></td>
          </tr>
          <tr>
            <td align="center" style="text-align:center;" class="Noprint" colspan="3">
              <input class="printbut Noprint" type="button" name="numClear" id="numClear" value="清 空"> &nbsp;&nbsp;&nbsp;&nbsp;
              <input class="printbut Noprint" type="button" name="numprint" id="numprint" value="打 印">
            </td>
          </tr>
        </tbody>
      </table>
      <span class='periods'>第 {{periods}} 期,3天內有效!!</span>
    </div>
  </div>
</template>
<script>
  import moment from 'moment'
  import { uuid } from '../libs/utils'

  export default {
    name: 'bill',
    props: {
      member: {
        type: String,
        default: 'A2114'
      },
      periods: {
        type: String,
        default: '18019'
      },
      list: {
        type: Array,
        default () {
          return [{
            no: '1XX1',
            odds: '93',
            money: '2'
          }]
        }
      }
    },
    data () {
      let time = moment().format('YYYY-MM-DD hh:mm');
      let number = '533420926' + uuid(8, 10)
      return {
        time: time,
        number: number,
        count: '1',
        sum: '3',
        index: 0
      }
    },
    methods: {
      // 刷新，点击 设置图示
      refresh () {
        console.log('刷新')
        console.log(this.list)
      }
    }
  }
</script>
