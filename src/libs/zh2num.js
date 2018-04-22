function zh2num (digit) {
  const zh = ['一', '二', '三', '四', '五', '六', '七', '八', '九']
  const units = ['十']

  const getNumber = num => (zh.indexOf(num) + 1)
  const getUnit = num => {
    let index = units.indexOf(num) + 1
    return Math.pow(10, index)
  }
  const getQuot = digit => {
    let zhStr = zh.join('')
    let unStr = units.join('')
    let reg = `[${zhStr}][${unStr}]?|[${zhStr}]?[${unStr}]`
    reg = new RegExp(reg, 'g')
    return digit.match(reg) || []
  }

  let result = 0
  let quots = getQuot(digit)

  quots.forEach(item => {
    let temps = item.split('')
    let unit = 1
    let temp = 1
    temps.forEach(tmp => {
      if (~units.indexOf(tmp)) {
        unit = getUnit(tmp)
      } else {
        temp = getNumber(tmp)
      }
    })
    result += temp * unit
  })

  return '=' + result
}

export {
  zh2num
}