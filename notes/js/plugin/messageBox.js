/**
 * message box插件
 * https://cn.vuejs.org/v2/api/#Vue-extend
 */

const messageBoxPlugin = {};

const Message = {
    data() {
        return {
            display: false,
            message: null,
        }
    },
    methods: {
        show(message) {
            this.display = true;
            this.message = message
        },

        cancle() {
            this.display = false;
        },

        success() {
            this.display = false;
        }
    },

    template: `
        <div v-if="display" style="display: flex;top: 0;bottom: 0;left: 0;right: 0;
        background-color: #9e9e9e33;position: fixed;z-index: 100;justify-content: center;align-items: center;">
            <div style="width: 391px;background: #fff;background-clip: padding-box;outline: 0;
            -webkit-user-select: text;border: 1px solid transparent;-webkit-border-radius: 8px;border-radius: 8px;
            -webkit-box-shadow: 0 4px 8px rgba(0, 0, 0, .32), 0 8px 40px rgba(0, 0, 0, .4);
            box-shadow: 0 4px 8px rgba(0, 0, 0, .32), 0 8px 40px rgba(0, 0, 0, .4);padding: 24px;z-index: 101;">
                <div style="display: flex;justify-content: space-between;font-size: 18px;margin-bottom: 16px;">
                    <span>提示</span>
                    <span title="关闭" style="cursor: pointer;opacity: .7;" @click="cancle">
                        <svg x="0px" y="0px" width="10px" height="10px" viewBox="0 0 10 10"
                            focusable="false" fill="#000000">
                            <polygon
                                points="10,1.01 8.99,0 5,3.99 1.01,0 0,1.01 3.99,5 0,8.99 1.01,10 5,6.01 8.99,10 10,8.99 6.01,5 ">
                            </polygon>
                        </svg>
                    </span>
                </div>
                <div style="color:grey">{{ message }}</div>
                <div style="display: flex;justify-content: flex-end;margin-top: 15px;text-align: right;">
                    <button style="
                        border: 1px solid transparent;
                        box-sizing: border-box;
                        cursor: pointer;
                        display: inline-block;
                        margin: 0 8px;
                        outline: none;
                        overflow: hidden;
                        -webkit-tap-highlight-color: transparent;
                        transition: color 200ms cubic-bezier(0.4, 0.0, 0.2, 1), background 200ms cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 400ms cubic-bezier(0.4, 0.0, 0.2, 1);
                        border-radius: 2px;
                        font-weight: 500;
                        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
                        min-width: 64px;
                        padding: 0 16px;
                        text-align: center;
                        text-transform: uppercase;
                        font-size: 13px;
                        line-height: 30px;
                        min-height: 32px;
                        background: transparent;
                        color: #202124;
                        box-shadow: none;
                        -webkit-box-ordinal-group: 1;
                        -webkit-order: 1;
                        order: 1;
                        color: rgba(255, 255, 255, 1);
                        fill: rgba(255, 255, 255, 1);
                        fill: #202124;
                        background:#f56c6c"
                        @click="cancle">
                        取消
                    </button>
                    <button style="
                        border: 1px solid transparent;
                        box-sizing: border-box;
                        cursor: pointer;
                        display: inline-block;
                        margin: 0 8px;
                        outline: none;
                        overflow: hidden;
                        -webkit-tap-highlight-color: transparent;
                        transition: color 200ms cubic-bezier(0.4, 0.0, 0.2, 1), background 200ms cubic-bezier(0.4, 0.0, 0.2, 1), box-shadow 400ms cubic-bezier(0.4, 0.0, 0.2, 1);
                        border-radius: 2px;
                        font-weight: 500;
                        font-family: Roboto, RobotoDraft, Helvetica, Arial, sans-serif;
                        min-width: 64px;
                        padding: 0 16px;
                        text-align: center;
                        text-transform: uppercase;
                        font-size: 13px;
                        line-height: 30px;
                        min-height: 32px;
                        background: transparent;
                        color: #202124;
                        box-shadow: none;
                        -webkit-box-ordinal-group: 1;
                        -webkit-order: 1;
                        order: 1;
                        background: #4285f4;
                        color: rgba(255, 255, 255, 1);
                        fill: rgba(255, 255, 255, 1);
                        fill: #202124;"
                        @click="success">
                        确定
                    </button>
                </div>
            </div>
        </div>
    `,
}

messageBoxPlugin.install = function (Vue) {

    let vm = {}
    const messageBoxPlugin = Vue.extend(Message)
    vm = new messageBoxPlugin().$mount()
    document.body.appendChild(vm.$el)

    Vue.prototype.$message = (option={}) => {
        return new Promise((resolve, reject) => {
            vm.show(option.message);
            const success = vm.success;
            const cancle = vm.cancle;
            vm.success = () => {
                success();
                resolve("ok");
            }
            vm.cancle = () => {
                reject("cancle");
                cancle();
            }
        });
    }
}

export default messageBoxPlugin;