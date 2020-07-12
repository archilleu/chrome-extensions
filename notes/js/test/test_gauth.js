import GAuth from '../api/gauth.js'

document.addEventListener('DOMContentLoaded', async () => {
    debugger

    //撤销授权
    console.log("开始撤销授权");
    try {
        await GAuth.removeCachedAuth(false);
        console.log("撤销授权成功");
    } catch (e) {
        throw Error("撤销授权失败");
    }

    //开始授权
    console.log("开始授权");
    try {
        let token = await GAuth.auth();
        console.log("授权成功");
        console.log(`token:${token}`);
    } catch (e) {
        throw Error("授权失败");
    }

    //撤销chrome授权
    console.log("开始撤销chrome授权");
    try {
        await GAuth.revokeAuth();
        console.log("撤销chrome授权成功");
    } catch (e) {
        throw Error("撤销chrome授权失败");
    }

    console.log("done!");

});