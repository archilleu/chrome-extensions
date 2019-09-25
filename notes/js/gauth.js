/**
 * google 账户授权
 */

class GAuth {

    //请求google账户授权访问
    auth(option) {
        chrome.identity.getAuthToken({
            interactive: true
        }, (token) => {
            if (chrome.runtime.lastError) {
                option.error && option.error(chrome.runtime.lastError);
                return;
            }

            this.accessToken = token;
            option.success && option.success(token);
        });
    }

    //清除授权缓存
    removeCachedAuth(option) {

        //因为授权有可能丢失，所以先获取授权在取消授权缓存
        chrome.identity.getAuthToken({
            interactive: false
        }, (token) => {
            if (chrome.runtime.lastError) {
                option.error && option.error(chrome.runtime.lastError);
                return;
            }

            chrome.identity.removeCachedAuthToken({
                    token: token
                },
                () => {
                    option.success && option.success();
                    this.accessToken = null;
                }
            );
        });

    }

    //解除chrome账号授权
    revokeAuth(option) {
        if (this.accessToken) {
            const xhr = new XMLHttpRequest();
            xhr.timeout = 15000;
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    option.success && option.success();
                }
            }
            xhr.ontimeout = function() {
                option.error && option.error();
            }
            xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + this.accessToken);
            xhr.send();
            this.removeCachedAuth({});
        }
    }
}