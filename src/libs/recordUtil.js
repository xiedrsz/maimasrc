import _ from 'lodash'
import Record from './Record'

/**
 * {@link Record} 类扩展
 * @typedef {Object} recordUtil
 * @property {function(no: string): number} income 收入金额
 * @property {function(filter: function): number} nos 号码个数
 * @property {function(): number} amount 吃码总额
 * @property {function(filter: function): number} eatMoney 吃码总额, 经过滤
 */
const recordUtil = {
  income (no) {
    let record = this.record
    let income = this.overview()
    let [a, b, c, d] = no
    let reg = `^[X${a}][X${b}][X${c}][X${d}]$`
    let loss
    reg = new RegExp(reg)
    // 收入
    income = _.values(income)
    income = _.sum(income)
    // 赔付
    record = _.pickBy(record, (val, key) => {
      return reg.test(key)
    })
    loss = _.map(record, list => {
      list = _.map(list, ({f, m}) => f * m)
      return _.sum(list)
    })
    loss = _.sum(loss)
    return income - loss
  },
  nos (filter = () => true) {
    let no = this.keys()
    no = _.filter(no, filter)
    return no.length
  },
  amount () {
    let total = this.overview()
    total = _.sum(_.values(total))
    return total
  },
  /**
   * 吃码总额.
   * @param {function(key: sting): boolean} filter 加工程序
   * @return {number} 吃码总额
   */
  eatMoney (filter = () => true) {
    let money = this
      .cloned()
      .filterNo((val, key) => {
        return filter(key)
      })
      .amount()
    this.restore()
    return money
  }
}

Record.extends(recordUtil)
