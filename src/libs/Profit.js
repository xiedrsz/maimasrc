// 决策系统
import _ from 'lodash'
import Reg from './Reg'
import Record from './Record'
import numbers from './numbers'
import './recordUtil'
/**
 * 所有开奖号码.
 * @typedef {string[]} number
 */
const number = numbers.split(',')
/**
 * 亏损中奖概率，87.04.
 * @typedef {number} LossCover
 */
// const LossCover = 87.04
/**
 * 平均盈利概率，66.72.
 * @typedef {number} AveWin
 */
// const AveWin = 66.72
/**
 * 四字赔率，8500.
 * @typedef {number} SiOdd
 */
const SiOdd = 8500
/**
 * 概览对比.
 * @typedef {function} overDiff
 * @param {Object} newOver 新概览
 * @param {Object} oldOver 旧概览
 * @return {string[]} 打回号码
 */
function overDiff (newOver, oldOver) {
  let result = _.mergeWith(oldOver, newOver, (old, src) => {
    return old - src
  })
  result = _.pickBy(result, value => value)
  result = _.map(result, (m, n) => `${n}=${m}`)
  return result
}

/**
 * @desc 吃码记录处理类.
 */
export default class Profit extends Record {
  /**
   * @param {Object} [record={}] 吃码记录.
   */
  constructor (record = {}) {
    super(record)
    // 按需调用
    // this.calcLoss()
  }

  /**
   * 计算赔付
   * @return {Object} 本身
   */
  calcLoss () {
    let total = 0
    let loss = {}
    let keys = this.keys()
    let lossSrc = this.toLoss()
    let record = this.toArray()
    /**
     * 总收入.
     * @type {number}
     * @private
     */
    this.total = total = this.amount()
    _.forEach(number, no => {
      let reg = Reg.kaima(no)
      let nos = _.filter(keys, key => reg.test(key))
      let len = nos.length
      if (len) {
        let list = _.filter(record, ({n}) => ~nos.indexOf(n))
        let lossTmp = _.pick(lossSrc, nos)
        let money = _.sum(_.values(lossTmp))
        let income = total - money
        loss[`_${no}`] = {
          no,
          list,
          keys: nos,
          money,
          income
        }
      }
    })
    /**
     * 赔付.
     * @type {Object}
     * @private
     * @example
     * {
     *   _0000: {
     *    no: '0000',
     *    list: [{
     *     n: '0XX0',
     *     f: '95',
     *     m: '1',
     *     dt: '06-12 18:30:24'
     *    }],
     *    keys: ['0XX0'],
     *    money: 95,
     *    income: 2009
     *  }
     * }
     */
    this.loss = loss
    return this
  }

  /**
   * 中奖概率.
   * @return {number} 中奖概率
   */
  coverage () {
    let loss = this.loss
    loss = _.keys(loss).length
    loss /= 100
    return loss
  }

  /**
   * 盈利概率.
   * @return {number} 盈利概率
   */
  win () {
    let loss = this.loss
    let rate = _.filter(loss, ({income}) => income >= 0).length
    loss = _.keys(loss).length
    loss = 10000 - loss
    rate = (rate + loss) / 100
    return rate
  }

  /**
   * 决策.
   * @return {boolean} 是否吃得
   * @example
   * 目前决策策略
   * [0] 前提条件：二字单笔最大额在10笔内
   * [1] 盈利概率小于65，不吃
   * [2] 中奖概率高于亏损平均，盈利概率低于平均, 不吃，暂时屏蔽
   * [3] 10 50 交集
   */
  decision () {
    let record = _.cloneDeep(this.record)
    // 单笔限额 10 笔
    this.limitOne(10)
    this.calcLoss()
    let wrate1 = this.win()
    this.restore(record)
    // 单笔限额 50 笔
    this.limitOne()
    this.calcLoss()
    let wrate2 = this.win()
    this.restore(record)
    if (wrate1 < 65 || wrate2 < 65) {
      return false
    }
    return true
  }

  /**
   * 风险控制.
   * @return {string[]} 要打回的号码
   * @example
   * 目前风险控制策略:
   * [1] 二字单笔吃额控制，默认最大50笔
   * [2] 二字最大赔付金额，默认比过滤后的总收入约高3000元
   * [3] 最大亏损金额控制，默认最大亏损12000元
   * 返回结果如下:
   * ['1234=1', '2345=2', ...]
   */
  riskControl () {
    // 旧概览
    let oldOver = this.overview()
    let newOver, max, loss, back, big
    // [1] 二字单笔吃额控制，默认最大50笔
    this.limitOne(50)
    // this.limitOne(10)
    // [2] 二字最大赔付金额，默认比过滤后的总收入约高3000元，Todo
    /**
     * 二字限额.
     * @type {number}
     * @private
     */
    this.max = max = this.amount() + 2535
    this.limit(max)
    // 计算赔付
    this.calcLoss()
    // [3] 最大亏损金额控制，默认最大亏损12000元
    newOver = this.overview()
    back = overDiff(newOver, oldOver)
    loss = this.loss
    big = _.filter(loss, ({income}) => {
      if (income < -12000) {
        return true
      }
    })
    big = _.map(big, ({no, income}) => {
      let m = ~~(-income / SiOdd)
      return `${no}=${m}`
    })
    back = back.concat(big)
    return back
  }

  /**
   * 少吃.
   * @return {string[]} 要打回的号码
   * @example
   * 目前风险控制策略:
   * [1] 二字吃掉被打次数小于或等于3次的号码
   * [2] 三字、四字全部吃
   * [3] 控制二字最大赔付暂不控制
   * 返回结果如下:
   * ['1234=1', '2345=2', ...]
   */
  little () {
		let oldOver = this.overview()
		let nums = this.nums()
    let keys = []
    _.forEach(nums, (val, key) => {
      if (val < 4) {
        keys.push(key)
      }
    })
    this.filterNo((val, key) => ~keys.indexOf(key))
		let newOver = this.overview()
		let back = overDiff(newOver, oldOver)
		return back
  }

  /**
   * 决策执行.
   * @param {boolean} [force] 强制少吃
   * @return {Object} 决策执行结果
   * @example
   * 目前决策执行执行策略如下：
   * [1] 决策为true, 可吃
   * [2] 决策为false, 风险过高，少吃（少吃指被打次数少于等于3次）
   * 返回结果如下：
   * {
   *   flag: true,
   *   total: 2890,
   *   max: 5554,
   *   cover: 89.02
   *   wrate: 67.98
   *   back: ['1XX1=120', ...]
   * }
   */
  execute (force) {
		let record = _.cloneDeep(this.record)
		let flag = this.decision()
		let cover, wrate, back, max, total
		if (!force && flag) {
			back = this.riskControl()
			max = this.max
		} else {
			this.restore(record)
			back = this.little()
			this.calcLoss()
			max = '-'
		}
		cover = this.coverage()
		wrate = this.win()
		total = this.total
		return {
			flag, max, total, cover, wrate, back
		}
  }

  /**
   * 收入.
   * @override
   * @param {string} [no=''] 开奖号码.
   * @return {number} 收入
   */
  income (no = '') {
    let loss = this.loss[`_${no}`] || {}
    let income = loss.income || this.total
    return income
  }
}
