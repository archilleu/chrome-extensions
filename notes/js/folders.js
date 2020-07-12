import folder from "./folder.js"
import GNode from "./gnote.js"

export default {
    data() {
        return {
            folders: [],
        }
    },

    components: {
        folder
    },

    methods: {
        //获取便签文件夹列表
        async noteFolders() {
            this.folders = await GNode.noteFolders();
        },

        async handleCreate() {

            console.log("create");
        },
        async handleDelete() {
            console.log("delete");
        },
    },

    template: `
    <div class="folder-container" id="folder-container">
        <div class="search-box">
            <div class="search-bar">
                <div class="text-field-view">
                    <div class="search-icon"></div>
                    <input type="text" class="search-input" name="text-field" placeholder="搜索全部便签">
                    <div class="search-clear"></div>
                </div>
            </div>
        </div>
        <folder v-for="(folder, index) in folders" :key=folder.id :folder=folder :index=index>
        </folder>
        <div class="bottom-menu">
            <div title="新建文件夹" class="create-folder-btn" id="btn-folder-create" @click="handleCreate">
            </div>
            <div title="删除文件夹" class="delete-folder-btn" id="delete-folder-btn" @click="handleDelete">
            </div>
        </div>
    </div>
    `
}