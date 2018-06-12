// 链式处理
import _ from 'lodash'

class Chained {
  constructor (collection) {
    // Todo
    this.result = collection
  }

  then (func) {
    let res = this.result
    this.result = func ? func(res) : res
    return this
  }

  // 过滤
  filter (func = {}) {
    let res = this.result
    this.result = _.filter(res, func)
    return this
  }

  // 转换
  map (func = item => item) {
    let res = this.result
    this.result = _.map(res, func)
    return this
  }

  mapValues (func) {
    this.result = _.mapValues(this.result, func)
    return this
  }

  // 分组
  groupBy (func = '') {
    this.result = _.groupBy(this.result, func)
    return this
  }

  values () {
    this.result = _.values(this.result)
    return this
  }

  over () {
    return this.result
  }
}

export default Chained
