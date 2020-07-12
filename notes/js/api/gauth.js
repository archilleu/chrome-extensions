/**
 * google 账户授权
 */

export default {

    //请求google账户授权访问
    auth(interactive = true) {
        return new Promise((resolve, reject) => {
            chrome.identity.getAuthToken({
                interactive: interactive
            }, (token) => {
                if (token) {
                    resolve(token);
                    return;
                }
                reject(null);
            });
        });
    },

    //清除授权缓存
    removeCachedAuth() {
        return new Promise((resove, reject) => {
            this.auth(false).then(token => {
                chrome.identity.removeCachedAuthToken({
                        token
                    },
                    () => {
                        resove(null);
                    }
                );
            }).catch(err => {
                resove(null);
            });
        });
    },

    //解除chrome账号授权
    revokeAuth(option) {
        return new Promise((resove, reject) => {
            this.auth(false).then(token => {
                const xhr = new XMLHttpRequest();
                xhr.timeout = 15000;
                xhr.onreadystatechange = function () {
                    if (xhr.readyState == 4) {
                        if (xhr.status == 200) {
                            resove(null);
                        } else {
                            reject(null);
                        }
                    }
                }
                xhr.ontimeout = function () {
                    reject("timeout")
                }

                xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + token);
                xhr.send();
                this.removeCachedAuth({});
            }).catch(err => {
                reject(err)
            });
        });
    }
}