import folder from "./folder.js"
import GNote from "./gnote.js"

export default {
    data() {
        return {
            folders: [],
            showNewDlg: false,
            newName: null,
        }
    },

    components: {
        folder
    },

    methods: {
        //获取便签文件夹列表
        async noteFolders() {
            this.folders = await GNote.noteFolders();
        },

        showCreateDlg() {
            this.newName = "未命名文件夹";
            this.showNewDlg = true;
        },
        hideCreateDlg() {
            this.showNewDlg = false;
        },

        async handleCreate() {
            if (this.newName === "") {
                console.log("文件夹名字为空")
                return;
            }

            await GNote.folderCreate(this.newName);
            this.showNewDlg = false;
        },

        async handleDelete() {
            const selected = this.$store.getters.selectedFolder;
            if(!selected) {
                console.log("请选择文件夹");
                return;
            }

            await GNote.folderDelete(selected.id);
        },
    },

    template: `
    <div>
        <div class="search-box">
            <div class="search-bar">
                <div class="text-field-view">
                    <div class="search-icon"></div>
                    <input type="text" class="search-input" name="text-field" placeholder="搜索全部便签">
                    <div class="search-clear"></div>
                </div>
            </div>
        </div>
        <div class="folders">
            <folder v-for="(folder, index) in folders" :key=folder.id :folder=folder :index=index>
            </folder>
        </div>
        <div class="bottom-menu">
            <div title="新建文件夹" class="create-folder-btn" id="btn-folder-create" @click="showCreateDlg">
            </div>
            <div title="删除文件夹" class="delete-folder-btn" id="delete-folder-btn" @click="handleDelete">
            </div>
        </div>
        <!--新建文件夹窗口-->
        <div class="new-folder-wrapper" :class="{show: showNewDlg}">
            <div class="new-folder">
                <div class="title">
                    <span>新文件夹</span>
                    <span title="关闭" class="close" @click="hideCreateDlg">
                        <svg x="0px" y="0px" width="10px" height="10px" viewBox="0 0 10 10"
                            focusable="false" fill="#000000">
                            <polygon class="a-s-fa-Ha-pa"
                                points="10,1.01 8.99,0 5,3.99 1.01,0 0,1.01 3.99,5 0,8.99 1.01,10 5,6.01 8.99,10 10,8.99 6.01,5 ">
                            </polygon>
                        </svg>
                    </span>
                </div>
                <input class="new-name" type="text" v-model="newName" />
                <div class="action">
                    <button class="cancle" @click="hideCreateDlg">取消</button>
                    <button class="ok" @click="handleCreate">创建</button>
                </div>
            </div>
        </div>
    </div>
    `
}