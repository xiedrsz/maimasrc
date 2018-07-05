/**
 * @todo 三字正则 /^\d*X\d*$/
 * @todo 四字正则 /^\d{4}$/
 * @todo 二字正则 /^\d*X\d*X\d*$/
 * @todo 开奖号码abcd正则 /^[Xa][Xb][Xc][Xd]$/
 */

/**
 * 正则集合
 * @typedef {Object} Reg
 * @property {Object} erzi 二字(全部)正则
 * @property {Object} erzift 二字(除头尾)正则
 * @property {Object} touwei 头尾正则
 * @property {Object} sanzi 三字正则
 * @property {Object} sizi 四字正则
 * @property {function(no: string): Object} kaima 开奖号码正则
 */
export default {
  erzi: /^\d*X\d*X\d*$/,
  erzift: /^\d(X\d|\dX)X$|^X(\dX|X\d)\d$|^X\d{2}X$/,
  touwei: /^\dX{2}\d$/,
  sanzi: /^\d*X\d*$/,
  sizi: /^\d{4}$/,
  kaima (no) {
    let [a, b, c, d] = no
    let str = `^[X${a}][X${b}][X${c}][X${d}]$`
    return new RegExp(str)
  }
}
