import config from './config.js'

export default function $axios(options) {
    return new Promise((resolve, reject) => {

        if (!config.headers.Authorization) {
            throw Error('token is null');
        }

        const instance = axios.create({
            baseURL: config.baseUrl,
            headers: config.headers,
            timeout: config.timeout,
        });

        // request 请求拦截器
        instance.interceptors.request.use(
            config => {
                return config;
            },
            error => {
                console.error('request:', error);
                return Promise.reject(error);
            }
        )

        // response 响应拦截器
        instance.interceptors.response.use(
            response => {
                return response.data;
            },
            err => {
                let res = {};
                if (err.response) { //服务器返回
                    res.code = err.response.status;
                } else if (err.request) { // 网络不通
                    res.code = -1;
                } else { //配置错误
                    res.code = -2;
                }
                switch (res.code) {
                    case -1:
                        res.message = '网络不通'
                        break;
                    case -2:
                        res.message = 'axios错误配置'
                        break;
                    case 403:
                        res.message = '会话过期，请重新登陆';
                        break
                    default:
                        res.message = err.response.data.error.message;
                }
                return Promise.reject(res);
            }
        )

        // 请求处理
        instance(options).then(res => {
            resolve(res);
        }).catch(error => {
            reject(error);
        });
    });
}