// 吃码记录处理系统
// 类中的方法不允许互相调用
import _ from 'lodash'
import moment from 'moment'

/**
 * @desc 吃码记录处理类.
 */
export default class Record {
  /**
   * @param {Object} [record={}] 原始吃码记录.
   */
  constructor (record = {}) {
    /**
     * 吃码记录.
     * @type {Object}
     * @private
     * @example
     * {
     *   1X23: [{
     *     id: "367260",
     *     f: "8500",
     *     m: "1",
     *     dt: "06-12 18:30:24"
     *   }]
     * }
     */
    this.record = record
  }

  /**
   * 扩展，为创建方法中调方法提供扩展
   * @param {Object} [option={}] 扩展配置
   */
  static extends (option = {}) {
    _.forEach(option, (todo, name) => {
      Record.prototype[name] = todo
    })
  }

  /**
   * 过滤号码.
   * @param {string[]|function(val: Object, key: string): boolean} [filter] 过滤器
   * @return {Object} 本身
   */
  filterNo (filter = () => true) {
    let record = this.record
    let type = Object.prototype.toString.call(filter)
    if (type === '[object Array]') {
      record = _.pick(record, filter)
    }
    if (type === '[object Function]') {
      record = _.pickBy(record, filter)
    }
    this.record = record
    return this
  }

  /**
   * 单笔最大限额控制，针对二字
   * @param {number} [maxMoney=50] 单次最大组数
   * @return {Object} 本身
   */
  limitOne (maxMoney = 50) {
    let record = this.record
    this.record = _.mapValues(record, list => {
      list = _.map(list, ({m, ...other}) => {
        m = +m < maxMoney ? m : maxMoney + ''
        return {
          ...other,
          m
        }
      })
      return list
    })
    return this
  }

   /**
   * 限制二字吃额
   * @param {number} money 二字最多赔付金额
   * @return {Object} 本身
   */
  limit (money) {
    if (!money) {
      return this
    }
    let record = this.record
    this.record = _.mapValues(record, (list, key) => {
      if (/^\d*X\d*X\d*$/.test(key)) {
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
      }
      return list
    })
    return this
  }

  /**
   * 时间限制
   * @param {string} [endTime=20:21] 截止时间
   * @param {string} [today] 当天时间
   * @return {Object} 本身
   */
  filterTime (endTime = '20:21', today) {
    let record = this.record
    let toYear
    today = today || moment().format('YYYY-MM-DD')
    toYear = today.substring(0, 4)
    endTime = `${today} ${endTime}`
    this.record = _.mapValues(record, list => {
      list = _.filter(list, ({dt}) => {
        return moment(`${toYear}-${dt}`).isBefore(endTime)
      })
      return list
    })
    return this
  }

   /**
   * 除空, 清除list为空的记录
   * @return {Object} 本身
   * @example
   * 过滤前
   * {
   *   1X23: [],
   *   X11X: [...]
   * }
   * 过滤后
   * {
   *   X11X: [...]
   * }
   */
  filterNull () {
    this.record = _.pickBy(this.record, list => {
      return list.length
    })
    return this
  }

  /**
   * 工位，设置工位处理流水线中的事务
   * @param {Object} option 工位配置
   * @param {function} option.todo 加工程序
   * @return {Object} 本身
   */
  station (option) {
    let {todo, ...other} = option
    let type = Object.prototype.toString.call(todo)
    if (type !== '[object Function]') {
      console.warn('无用工位')
      return this
    }
    other = _.values(other)
    todo.call(this, ...other)
    return this
  }

  /**
   * 创建分身，以暂存
   * @return {Object} 本身
   */
  cloned () {
    /**
     * 暂存，结构同{@link record}.
     * @type {Object}
     * @private
     */
    this.store = _.cloneDeep(this.record)
    return this
  }

  /**
   * 还原分身
   * @param {Object} [record] 记录
   * @return {Object} 本身
   */
  restore (record) {
    let store = record || this.store
    this.record = store
    return this
  }

  /**
   * 号码列表
   * @return {string[]} 号码列表
   */
  keys () {
    return _.keys(this.record)
  }

  /**
   * 值
   * @return {Object} record
   */
  value () {
    return this.record
  }

  /**
   * 吃码概览
   * @return {Object} 吃码金额统计
   * @example
   * 返回结果
   * {
   *   1X23: 15
   * }
   */
  overview () {
    let result = _.mapValues(this.record, list => {
      return _.sum(_.map(list, ({m}) => +m))
    })
    return result
  }

  /**
   * 赔付.
   * @return {Object} 吃码赔付.
   * @example
   * 返回结果
   * {
   *   1XX3: 190
   * }
   */
  toLoss () {
    let result = _.mapValues(this.record, list => {
      return _.sum(_.map(list, ({m, f}) => f * m))
    })
    return result
  }

  /**
   * 转成数据
   * @return {Object[]} 中奖明细说明
   * @example
   * 返回结果
   * [{
   *    n: '1XX2',
   *    f: '8500',
   *    m: '1',
   *    dt: '06-12 18:30:24'
   * }]
   */
  toArray () {
    let record = this.record
    let result = []
    _.forEach(record, (list, n) => {
      list = _.map(list, item => {
        return {
          n,
          ...item
        }
      })
      result = result.concat(list)
    })
    return result
  }
}
