/**
 * @module test 测试
 * @author xiedrsz
 * @since 2018.09.04
 */
export default {
  getUsers: {
    path: '/users',
    method: 'GET',
    pattern: {
      'users|1-10': [{
        // 属性id是一个自增数，起始值为1，每次增1 
        'id|+1': 1,
        'name': '@name'
      }]
    }
  }
}
