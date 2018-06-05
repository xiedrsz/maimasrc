import { suffix, record } from './utils'

export default class Parser {
  constructor (no, server) {
    this.result = []
    this.error = false
    let self = this
    let label = /wk/.test(server) ? 'kk' : 'a'
    let i = 0
    let preMoney = 1
    let money = ''
    let number = ''
    let numbers = ''
    let len
    let nos
    no = no.toUpperCase()
    nos = no.split(/[,|，]/)
    len = nos.length
    nos.forEach(item => {
      let result = ['']
      let newResult = []
      let items = ''
      // 请求信息
      let post_number_money = ''
      let numLen = ''

      money = item.match(/=(\d+\.\d|\d+)$/)
      number = money ? money[0] : ''

      money = money ? +money[1] : preMoney
      number = item.replace(number, '')

      number = number.replace(/\-+/, 'XX')
      numbers = number.match(/\d+|[X]|[全]/g)
      numLen = numbers.length
      if (numLen === 4) {
        numbers.forEach(item => {
          item = item.replace('全', '0123456789')
          items = item.split('')
          items.forEach(one => {
            result.forEach(temp => {
              newResult.push(temp + one)
            })
          })
          result = newResult.slice(0).sort()
          newResult = []
        })
      } else if (numLen < 4) {
        result = [number]
      } else {
        self.error = '您输入的号码格式有误,请检查\n'
        return
      }
      post_number_money = result.join(',')
      // 校验
      if (!/^[\dX]{4}(\,[\dX]{4})*$/.test(post_number_money)) {
        self.error = `您输入的号码格式有误,当前解析结果如下\n${post_number_money}\n`
        return
      }

      self.result.push({
        post_number_money,
        money
      })
      preMoney = money
    })
  }

  then (func) {
    let result = this.result
    let list = []
    if (result.length) {
      result.forEach(({money, post_number_money}) => {
        let temp = post_number_money.split(',')
        temp = temp.map(no => `${no}|${money}`)
        list = list.concat(temp)
      })
      func(list)
    }
    return this
  }

  catch (func) {
    let error = this.error
    if (error) {
      func(error)
    }
  }
}
