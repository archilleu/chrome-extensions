
export default {
  method: 'get',
  // 基础url前缀
  baseUrl: 'https://www.googleapis.com',
  // 请求头信息
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  },
  // 参数
  data: {},
  // 设置超时时间
  timeout: 15000,

  // 返回数据类型
  responseType: 'json',

  setToken(token) {
    this.headers['Authorization'] = `Bearer ${token}`;
  }

}
