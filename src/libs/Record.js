// 吃码记录处理系统
import _ from 'lodash'
import moment from 'moment'

class Record {
  constructor (record) {
    let recordDef = localStorage.getItem('chiRecord') || '{}'
    recordDef = JSON.parse(recordDef)
    this.record = record || recordDef
  }

  /**
   * @Function overview
   * @Description 吃码概览
   * @Param cb Function 回调函数
   *  @Param res eg: {0XX1: 15, ...}
   * @Return this
   */
  overview (cb = res => console.warn(res)) {
    let record = this.record
    let result = _.mapValues(record, list => {
      return _.sum(_.map(list, ({m}) => +m))
    })
    cb(result)
    return this
  }
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
        m = m < n ? m : n
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
  lottery,
  limit,
  overview,
  filterTime,
  filterNull,
  limitOne
}
export default Record
