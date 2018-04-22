import { zh2num } from './zh2num'
export default function (string) {
  let no = string.toUpperCase()

  no += '组'
  // [1] 替换错别字
  no = no
    .replace(/\d{1,2}\:\d{1,2}/g, '') // 去掉时间
    .replace(/[二三四]字/g, '')
    .replace(/[—一－-]+/g, '-')
    .replace(/[oO]/g, '0')
    .replace(/[|]/g, '1')
    .replace(/[㐅*✘Ⅹ×？乂]/g, 'X')
    // .replace(/[、]+/g, '.')
    .replace(/\-([,，=])/g, 'X$1')
    .replace(/([,，=])\-/g, '$1X')
    .replace(/＝/g, '=')
    .replace(/[。、]+/g, ',')

  // [2] 语义转换
  let temp
  let noArr
  let tnum
  let treplace

  // 号码识别
  while (temp = /(\d+头|\d+千位?|\d+百位?|\d+十位?)+(\d+个位?|\d+尾|\d+)?/.exec(no)) {
    noArr = temp[0].match(/(\d+头|\d+千位?)?(\d+百位?)?(\d+十位?)?(\d+个位?|\d+尾|\d+)?/)
    treplace = ''
    for (let i = 1; i < 5; i++) {
      tnum = noArr[i] ? noArr[i].match(/\d+/) : 'X'
      treplace += `${tnum}.`
    }
    treplace = treplace
      .replace(/\.?X\.?/g, 'X')
      .replace(/X{2,}/g, '-')
    no = no.replace(temp[0], treplace)
  }

  // 汉字数字识别
  while (temp = /[一二三四五六七八九十]+/.exec(no)) {
    tnum = zh2num(temp[0])
    no = no.replace(temp, tnum)
  }

  // 金额识别
  while (temp = /[\(（各打]+\d+组?[）\)]?|\d+[组元块]/.exec(no)) {
    tnum = temp[0].match(/\d+/)
    no = no.replace(temp, `=${tnum},`)
  }

  // [3] 没用字符（如：空格、换行等）清理
  no = no
    .replace(/\s+/g, ',')
    .replace(/[.，,=]+=/g, '=')
    .replace(/[,，\.]{2,}/g, ',')
    .replace(/[^\dXx全\.\-,，=]/g, '')
    .replace(/[,，]$/, '')

  // [4] 价格重置
  no = no.match(/[\dX.全\-]+(=\d+)?/g)
  let j = 0
  let len = no.length
  let first = -1
  for (; j < len; j++) {
    tnum = no[j].match(/=\d+/g)
    if (!tnum && first === -1) {
      first = j
    } else if (tnum) {
      no[first] += tnum[0]
      first = -1
    }
  }
  no = no.join(',')

  return no
}
