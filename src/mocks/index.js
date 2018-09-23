/**
 * @module mocks 配置mocks
 * @author xiedrsz
 * @since 2018.09.04
 */
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import Mock from 'mockjs'

import Apis from './Apis'
import Test from './test'

const mock = new MockAdapter(axios)
const Responses = Object.assign({}, Test)
const Meth = {
  GET: 'onGet',
  POST: 'onPost'
}

Apis.forEach(name => {
  let item = Responses[name] || {}
  let path = item.path
  let method = item.method
  let pattern = item.pattern
  /* eslint no-cond-assign: "off" */
  if (method = Meth[method]) {
    mock[method](path).reply(() => {
      let res = Mock.mock(pattern)
      return [200, res]
    })
  }
})

// 通过没有配置的
mock.onAny().passThrough()
