import qs from 'qs'
import _ from 'lodash'
import moment from 'moment'
import config from '../config'
const { env } = config

// 请求配置
const suffix = {
  kk: [',|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,||,,,|0,0,0,0,|0,0,,,|0,0,||||0,0,|||0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||', '|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,||,,,|0,0,0,0,|0,0,,,|0,0,||0,0,||0,0,|0,0,||0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||', '|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,|,,|,,,||0,0,,,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||'],
  a: ['|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,||,,,|0,0,0,0,|0,0,,,|0,0,||||0,0,|||0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||', '|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,||,,,|0,0,0,0,|0,0,,,|0,0,||0,0,||0,0,|0,0,||0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||', '|0,1,0,0,0,0,,0,0,0,0,,0,0,0,0,,0,0,0,0,,|0,0,,|,,|,,,||0,0,,,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,|0,0,,,,|0,0,0,0,0,0,|0,0,0,0,0,0,|||']
}

// 请求明细地址
const detailUrl = {
  _: '/appindexajax.php?action=detail',
  _2: '/appindexajax.php?doaction=null&action=detail&s_number=&s_issueno=0&sizixian=0&soclass=0&s_money=&s_money_end=&s_classid=1',
  _3: '/appindexajax.php?doaction=null&action=detail&s_number=&s_issueno=0&sizixian=0&soclass=0&s_money=&s_money_end=&s_classid=4',
  _4: '/appindexajax.php?doaction=null&action=detail&s_number=&s_issueno=0&sizixian=0&soclass=0&s_money=&s_money_end=&s_classid=5'
}

// 唯一标志码
function uuid(len, radix) {
  let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('')
  let uuid = []
  let i
  radix = radix || chars.length
  if (len) {
    for (i = 0; i < len; i++) uuid[i] = chars[0 | Math.random() * radix]
  } else {
    let r
    uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
    uuid[14] = '4'
    for (i = 0; i < 36; i++) {
      if (!uuid[i]) {
        r = 0 | Math.random() * 16
        uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r]
      }
    }
  }
  return uuid.join('')
}

// 卖码记录
function record (list) {
  let nume = 0
  let nums = 0
  let numd = 0
  let maRecord = localStorage.getItem('maRecord') || '{}'
  maRecord = JSON.parse(maRecord)
  _.forEach(list, item => {
    let n = item.match(/[\dX]{4}/)[0]
    let m = +item.replace(`${n}|`, '')
    let t = n.match(/X/g) || []
    t = t.length;
    (t === 2) && nume++;
    (t === 1) && nums++;
    (t === 0) && numd++;
    n = `_${n}`
    maRecord[n] = (maRecord[n] || 0) + m
  })
  localStorage.setItem('maRecord', JSON.stringify(maRecord))
  return {
    nume,
    nums,
    numd
  }
}

// 发送单个快选
function singleKX (form, server) {
  return new Promise((resolve, reject) => {
    let iframe = document.createElement("iframe")
    let url = env === 'pro' ? `${server}/appindexajax.php` : 'http://www.runoob.com/try/ajax/jsonp.php?jsoncallback=callbackFunction'
    let sform
    // 生成请求地址
    form.action = 'soonselectnumber'
    form.sizixian = '0'
    form.zjzc = '0'
    form.strarray = ''
    form.lujingstat = '3'
    sform = qs.stringify(form)
    url += `?${sform}`
    iframe.src = url
    // 结果处理
    iframe.onload = event => {
      let {post_number_money, post_money, selectnumbertotal_hidden } = form
      let log, totalNo, totalMoney
      if (!event) {
        reject('ERROR')
      }
      log = `${post_number_money}: ${post_money}元\n`
      totalNo = +selectnumbertotal_hidden
      totalMoney = selectnumbertotal_hidden * post_money
      iframe.remove()
      resolve({
        log, totalNo, totalMoney
      })
    }
    // 发送请求
    document.body.appendChild(iframe)
  })
}

// 快选，升级版
function soonselect (form, server) {
  return new Promise((resolve, reject) => {
    let iframe = document.createElement("iframe")
    let url = env === 'pro' ? `${server}/appindexajax.php` : 'http://www.runoob.com/try/ajax/jsonp.php?jsoncallback=callbackFunction'
    let sform
    // 生成请求地址
    _.assign(form, {
      action: 'soonselectnumber',
      post_money: '',
      sizixian: '',
      selectlogsclassid: '0',
      zjzc: '0',
      selectlogs: '',
      strarray: '',
      lujingstat: '4',
      versionName: '0.0.1'
    })
    sform = qs.stringify(form)
    url += `?${sform}`
    iframe.src = url
    // 结果处理
    iframe.onload = () => {
      let {post_number_money, selectnumbertotal_hidden } = form
      let list = post_number_money.split(',')
      let money = _.map(list, item => +item.replace(/[\dX]{4}\|/, ''))
      let log
      money = _.sum(money)
      list = _.map(list, item => (item.replace('|', ': ') + '元'))
      list = list.join('\n')
      log = `本次共买${selectnumbertotal_hidden}笔, ${money}元\n详情如下: \n${list}\n`
      iframe.remove()
      resolve(log)
      reject(false)
    }
    // 发送请求
    document.body.appendChild(iframe)
  })
}

// 休息
function sleep (time) {
  return new Promise((resolve, reject) => {
    let timer = setTimeout(() => {
      clearTimeout(timer)
      resolve('ok')
      reject('err')
    }, time)
  })
}

// 吃码分析
function chiMa (result) {
  // 赔付额度
  let maxMoney = [8600, 8700, 47500]
  // 待退码id序列
  let tuimaid = localStorage.getItem('tuimaid')
  // 不可再吃号码列表
  let dontChi = localStorage.getItem('dontChi') || '[]'
  // 有料列表
  let youLiao = localStorage.getItem('youLiao') || '[]'
  // 要先买列表
  let toBuy = localStorage.getItem('toBuy') || '[]'
  // 吃码记录
  let chiRecord = localStorage.getItem('chiRecord') || '{}'
  // let detailitem = result.match(/\[(\{[^\{^\}]+\}\,?\s*)+\]?/g)
  let detailitem = result.match(/\[({[^{^}]+},?\s*)+\]?/g)
  // detailitem = detailitem[0].replace(/\,$|\]$/, ']')
  detailitem = detailitem[0].replace(/,$|\]$/, ']')
  tuimaid = tuimaid ? tuimaid.split('|') : []
  dontChi = JSON.parse(dontChi)
  youLiao = JSON.parse(youLiao)
  dontChi = dontChi.concat(youLiao)
  toBuy = JSON.parse(toBuy)
  chiRecord = JSON.parse(chiRecord)
  detailitem = JSON.parse(detailitem)
  // 过滤掉可退的号码
  detailitem = _.filter(detailitem, item => {
    let {tm, n} = item
    if (tm !== '--') {
      return false
    }
    // 不可再吃
    if (~dontChi.indexOf(n)) {
      return false
    }
    return true
  })
  _.forEach(detailitem, item => {
    // id 编号 号码 赔率 金额 下码时间
    let {id, n, f, m, dt} = item
    let money = f * m
    let temp = chiRecord[n] || []
    let total = _.sum(_.map(temp, ({f, m}) => (f * m)))
    let max = n.match(/X/g) || []
    let num
    max = max.length
    max = maxMoney[max]
    // 不可再吃
    if (~dontChi.indexOf(n)) {
      return
    }
    if (total + money < max) {
      // 可全吃
      tuimaid.push(id)
      temp.push({
        id, f, m, dt
      })
    } else {
      // 只能吃部分
      dontChi.push(n)
      num = ~~((max - total) / f)
      // 有吃的
      if (num) {
        tuimaid.push(id)
        temp.push({
          m: num,
          id, f, dt
        })
        // 有要买的
        if (m - num) {
          toBuy.push({
            m: m - num,
            n, id
          })
        }
      }
    }
    // 去重
    temp = _.uniqBy(temp, 'id')
    chiRecord[n] = temp
  })
  tuimaid = tuimaid.join('|')
  // 暂存
  localStorage.setItem('tuimaid', tuimaid)
  localStorage.setItem('chiRecord', JSON.stringify(chiRecord))
  localStorage.setItem('toBuy', JSON.stringify(toBuy))
  localStorage.setItem('dontChi', JSON.stringify(dontChi))
  // 返回
  let len = detailitem[0].n.match(/X/g) || []
  let ret = ['numd', 'nums', 'nume']
  len = len.length
  return ret[len]
}

// 发送退码请求
function tuiMa (tuimaid, server) {
  return new Promise((resolve, reject) => {
    let iframe = document.createElement("iframe")
    let url = env === 'pro' ? `${server}/appindexajax.php` : 'http://www.runoob.com/try/ajax/jsonp.php?jsoncallback=callbackFunction'
    let form = {
      action: 'ordertuima',
      tuimaid
    }
    // 生成请求地址
    form = qs.stringify(form)
    url += `?${form}`
    iframe.src = url
    // 结果处理
    iframe.onload = () => {
      let chiRecord = localStorage.getItem('chiRecord')
      let list = []
      localStorage.removeItem('tuimaid')
      iframe.remove()
      chiRecord = JSON.parse(chiRecord)
      _.forEach(_.keys(chiRecord), item => {
        let tmp = chiRecord[item]
        tmp = _.map(tmp, temp => {
          return {
            ...temp,
            n: item
          }
        })
        list = list.concat(tmp)
      })
      list = _.filter(list, ({id}) => {
        return ~tuimaid.indexOf(id)
      })
      resolve(list)
      reject(false)
    }
    // 发送请求
    document.body.appendChild(iframe)
  })
}

// 发送清空请求
function clearUp (server) {
   return new Promise((resolve, reject) => {
    let iframe = document.createElement("iframe")
    let url = env === 'pro' ? `${server}/ajax.php` : 'http://www.runoob.com/try/ajax/jsonp.php?jsoncallback=callbackFunction'
    let form = {
      action: 'soonprintstat',
      inajax: 1,
      sid: ''
    }
    // 生成请求地址
    form = qs.stringify(form)
    url += `?${form}`
    iframe.src = url
    // 结果处理
    iframe.onload = () => {
      iframe.remove()
      resolve(true)
      reject(false)
    }
    // 发送请求
    document.body.appendChild(iframe)
  })
}

// 赢率分析， 待优化
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
  // 吃码建议
  let aveWin = +localStorage.getItem('aveWin')
  let lossCoverage = +localStorage.getItem('lossCoverage')
  let lossWin = +localStorage.getItem('lossWin')
  let flag = true
  // 盈利概率低于亏损平均
  if (profit < lossWin) {
    flag = false
  }
  // 中奖概率高于亏损平局，盈利概率低于平均
  if (winR > lossCoverage && profit < aveWin) {
    flag = false
  }
  if (!flag) {
    result += '风险较高，不建议吃\n'
  }
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
  // [2] 控制最大亏损, 12000
  let Max = -localStorage.getItem('maxLoss') || -12000
  _.forEach(oddsList, ({no, money}) => {
    let odd = 8500
    let num = money < Max ? -~~(money / odd) : 0
    if (num) {
      num++
      result += `${no}=${num} `
    }
  })
  result += '\n'
  
  return result
}

// 中奖明细
function lottery (record, no) {
  if (!/^\d{4}/.test(no)) {
    return
  }
  let a = no[0]
  let b = no[1]
  let c = no[2]
  let d = no[3]
  let reg = new RegExp(`^[X${a}][X${b}][X${c}][X${d}]`)
  let income = 0
  let loss = 0
  let log = ''
  // 收入
  income = overview(record)
  income = _.sum(_.values(income))
  // 赔付
  record = _.pickBy(record, (val, key) => {
    return reg.test(key)
  })
  _.forEach(record, (value, key) => {
    value = _.map(value, ({dt, f, m}) => {
      loss += f * m
      return `${dt}: ${f}X${m}`
    })
    log += `${key}\n`
    log += value.join('\n') + '\n'
  })
  income -= loss
  log += `总收入: ${income}元`
  return log
}

// 限制二字吃额
function limit (record, money) {
  let result = _.mapValues(record, (list, key) => {
    let len = key.match(/X/g) || []
    len = len.length
    // 非二字
    if (len !== 2) {
      return list
    }
    list = _.reduce(list, (res, item) => {
      let {f, m} = item
      let total = _.sum(_.map(res, ({f, m}) => f * m))
      let n
      if (money - f > total) {
        n = ~~((money - total) / f)
        m = m < n ? m : n + ''
        _.assign(item, {
          m
        })
        res.push(item)
      }
      return res
    }, [])
    return list
  })
  return result
}

// 吃码概览
function overview (record) {
  let result = _.mapValues(record, list => {
    return _.sum(_.map(list, ({m}) => +m))
  })
  return result
}

// 时间限制
function filterTime (record, endTime) {
  let today = moment().format('YYYY-MM-DD')
  // let today = '2018-05-29'
  let toYear = moment().format('YYYY')
  endTime = `${today} ${endTime}`
  let result = _.mapValues(record, list => {
    list = _.filter(list, ({dt}) => {
      return moment(`${toYear}-${dt}`).isBefore(endTime)
    })
    return list
  })
  return result
}

// 除空
function filterNull (record) {
  let result = _.pickBy(record, list => {
    return list.length
  })
  return result
}

// 单笔最大限额控制, 针对二字
function limitOne (record, maxMoney = 50) {
  let result = _.mapValues(record, list => {
    list = _.map(list, ({m, ...other}) => {
      m = +m < maxMoney ? m : maxMoney + ''
      return {
        ...other,
        m
      }
    })
    return list
  })
  return result
}

export {
  suffix,
  detailUrl,
  uuid,
  record,
  singleKX,
  soonselect,
  sleep,
  chiMa,
  tuiMa,
  clearUp,
  analyze,
  lottery,
  limit,
  overview,
  filterTime,
  filterNull,
  limitOne
}
