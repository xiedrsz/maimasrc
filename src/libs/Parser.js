const PT = {
  'OOXX': 1, 
  'OXOX': 2, 
  'OXXO': 3, 
  'XOXO': 4, 
  'XOOX': 5, 
  'XXOO': 6,
  'OOOX': 7, 
  'OOXO': 8, 
  'OXOO': 9, 
  'XOOO': 10, 
  'OOOO': 11
}

export default class Parser {
  constructor (no) {
    this.result = []
    this.error = false
    let self = this
    let preMoney = 1
    let money = ''
    let number = ''
    let numbers = ''
    let nos
    no = no.toUpperCase()
    nos = no.split(/[,|，]/)
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

      number = number.replace(/-+/, 'XX')
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
      if (!/^[\dX]{4}(,[\dX]{4})*$/.test(post_number_money)) {
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
        temp = temp.map(no => {
          let tmp = no.replace(/\d/g, 'O')
          let dict_no_type_id = PT[tmp] || ''
          return {
            dict_no_type_id,
            bet_no: no,
            bet_money: money + ''
          }
        })
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
