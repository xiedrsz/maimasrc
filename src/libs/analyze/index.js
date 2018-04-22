import _ from 'lodash'

/**
 * @Function posibility
 * @Description 开奖赔付分析
 * @Param list Array 吃码记录
 * @Return Array 开奖赔付列表
 * @Label n-开奖号码，nos-中奖列表，o-赔付金额
 */
function posibility (list) {
  let ns = _.map(list, 'n')
  let result = []
  for (let a = 0; a < 10; a++) {
    for (let b = 0; b < 10; b++) {
      for (let c = 0; c < 10; c++) {
        for (let d = 0; d < 10; d++) {
          let reg = `^[${a}X][${b}X][${c}X][${d}X]$`
          let n = `${a}${b}${c}${d}`
          let nos
          let len
          reg = new RegExp(reg)
          nos = _.filter(ns, n => reg.test(n))
          len = nos.length
          if (len) {
            let o = _.sum(_.map(nos, n => {
              return _.filter(list, {
                n: n
              })[0].o
            }))
            result.push({
              n,
              nos,
              o
            })
          }
        }
      }
    }
  }
  return result
}

/**
 * @Function toBig
 * @Description 全转大奖
 * @Param list Array 开奖赔付列表
 * @Param bf Number 大奖赔付 [default 9600]
 * @Return Array 转大奖购买详情
 * @Label n-开奖号码，m-买入金额，o-赔付金额
 */
function toBig (list, bf = 9600, inc = 0) {
  let hf = ~~(bf / 2)
  let kk = []
  for(let x = 0; x < 15; x++) {
    let result = _.map(list, ({n, o}) => {
      let m = ~~(o / hf) + x
      m *= 0.5
      return {n, m, o}
    })
    let sum = _.sum(_.map(result, 'm'))
    let less = result.length
    let money
    result = toBigProfit(result, bf, inc)
    less = 10000 - less
    money = _.sum(_.map(result, 'pf'))
    money = (money - sum * less) / 10000
    result = _.filter(result, ({pf}) => pf > 0).length
//  console.log(sum)
//  console.log(result)
    kk.push({
      x,
      r: result,
      m: money,
      o: sum
    })
  }
  return kk
}

/**
 * @Function toBig
 * @Description 全转大奖
 * @Param list Array 开奖赔付列表
 * @Param bf Number 大奖赔付 [default 9600]
 * @Return Array 转大奖购买详情
 * @Label n-开奖号码，m-买入金额，o-赔付金额，pf-收益
 */
function toBigProfit (list, bf = 9600, inc = 0) {
  let outc = _.sum(_.map(list, 'm'))
  let total = outc - inc
  let result = _.map(list, ({n, m, o}) => {
    let pf = bf * m - total - o
    return {
      n, pf, o
    }
  })
  return result
}

class Analyze {
  /**
   * @Data 数据
   * @Param record Object 吃码原始记录
   * @Param error String 错误信息
   * @Param result Array 流程处理结果
   */

  /**
   * @Constructor 构造函数
   * @Param record Object 吃码记录
   */
  constructor (record) {
    if (_.isObject(record)) {
      this.record = _.cloneDeep(record)
    } else {
      this.record = {}
      this.error = '输入有误'
    }
  }

  /**
   * @Function 方法
   * @Description 将卖码记录转为数组
   * @Labels n-号码，m-金额，o-赔付
   * @Return this
   */
  toArray () {
    let record = _.cloneDeep(this.record)
    this.result = _.map(_.keys(record), n => {
      let detail = record[n]
      let m = _.sum(_.map(detail, ({m}) => +m))
      let o = _.sum(_.map(detail, ({f, m}) => f * m))
      return {n, m, o}
    })
    return this
  }

  /**
   * @Function 方法
   * @Description 下一步
   * @Param cb Function 回调
   * @Return this
   */
  then (cb) {
    let result = _.cloneDeep(this.result)
    cb(result)
    return this
  }

  /**
   * @Function 方法
   * @Description 转换
   * @Param cb Function 回调
   * @Return this
   */
  transform (cb, args = []) {
    let result = _.cloneDeep(this.result)
    args = _.map(args, item => {
      return this[item] || item
    })
    this.result = cb(result, ...args)
    return this
  }

  /**
   * @Function 方法
   * @Description 扩展
   * @Param key String 键
   * @Param cb Function 回调
   * @Return this
   */
  extends (key, cb) {
    let result = _.cloneDeep(this.result)
    this[key] = cb(result)
    return this
  }
  /**
   * @Function 方法
   * @Description 捕抓错误
   * @Param cb Function 回调
   * @Return this
   */
  catch (cb) {
    let err = this.error
    if (err) {
      cb(err)
    }
    return this
  }
}

export {
  posibility,
  toBig,
  toBigProfit,
  Analyze
}







function analyze (mas) {
  let list = [] // 转数组
  let total = 0 // 总收入金额
  let result = '' // 返回结果
  _.keys(mas).forEach(key => {
    // 收入、赔付统计
    let temp = mas[key]
    let money =  _.sum(_.map(temp, ({m}) => +m))
    let odds =  _.sum(_.map(temp, ({f, m}) => (f * m)))
    // 总收入统计
    total += money
    // 转数组
    list.push({
      key,
      money,
      odds
    })
  })
  // 记录
  result += `总收入: ${total}元\n`
  // 中奖可能分析
  let source = _.map(list, ({key}) => key)
  let profit = [] // 全吃盈利
  let num = 0 // 中奖号码个数
  for (let a = 0; a < 10; a++) {
    for (let b = 0; b < 10; b++) {
      for (let c = 0; c < 10; c++) {
        for (let d = 0; d < 10; d++) {
          let reg = `^[${a}X][${b}X][${c}X][${d}X]$`
          let no = `${a}${b}${c}${d}`
          let money = 0
          let nos
          let len
          reg = new RegExp(reg)
          nos = source.filter(item => (reg.test(item)))
          len = nos.length
          if (len) {
            num++
            // 赔付统计
            nos.forEach(item => {
              let key = item.replace('_', '')
              let {odds} = _.filter(list, {key})[0]
              money += odds
            })
            profit.push({
              no,
              money: total - money
            })
            money = 0
          }
        }
      }
    }
  }
  // 中奖概率
  let winR = num / 100
  result += `中奖概率为: ${winR}%\n`
  // 全吃盈利分析
  let len, average, statistics
  let oddsList = _.cloneDeep(profit)
  profit = _.countBy(profit, 'money')
  profit[total] = 10000 - num
  // 统计盈亏分布
  statistics = _.cloneDeep(profit)
  statistics = _.groupBy(_.keys(statistics), item => Math.floor(item / 1000))
  result += '收益分布如下： \n'
  _.forEach(_.keys(statistics).sort((a, b) => (b - a)), item => {
    let label = item >= 0 ? `${+item + 1}K-${item}K: ` : `${-item - 1}K-${-item}K: `
    let list = _.map(statistics[item], i => (profit[i]))
    let rate = _.sum(list) / 100
    result += `${label}${rate}%\n`
  })
  profit = _.map(_.keys(profit), key => ({
    money: +key,
    rate: profit[key] / 100
  }))
  profit.sort((a, b) => (b.money - a.money))
  len = profit.length - 1
  result += `全吃最多可赚${profit[0].money}元，开奖概率为：${profit[0].rate}%\n`
  result += `全吃最多可亏${-profit[len].money}元，开奖概率为：${profit[len].rate}%\n`
  average = _.reduce(profit, (sum, {money, rate}) => (sum + money * rate / 100), 0).toFixed(2)
  result += `全吃平均每期收益为：${average}元\n`
  profit = profit.filter(item => (item.money >= 0)).map(item => (item.rate))
  profit = _.sum(profit).toFixed(2)
  result += `全吃盈利概率:${profit}%\n`
  // 风险控制分析
  // [1] 买爆头尾提醒
  let dontChi = localStorage.getItem('dontChi') || '[]'
  let baoTw
  dontChi = JSON.parse(dontChi)
  dontChi = _.filter(dontChi, item => /\dXX\d/.test(item))
  baoTw = _.pick(mas, dontChi)
  result += '以下头尾吃被打过多，注意防范：\n'
  _.forEach(_.keys(baoTw), n => {
    let m = baoTw[n]
    m = _.map(m, ({m}) => +m)
    m = _.sum(m)
    result += `${n}=${m} `
  })
  result += '\n'
  result += '为降低风险建议买下如下号码\n'
  // [2] 控制最大亏损
  _.forEach(oddsList, ({no, money}) => {
    let odd = 8500
    let num = -~~(money / odd)
    if (num) {
      num++
      result += `${no}=${num} `
    }
  })
  result += '\n'
  return result
}