import folder from "./folder.js"
import GNote from "./gnote.js"

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
            this.folders = await GNote.noteFolders();

            //选中第一个文件夹(默认文件夹)
            this.selectedDefaultFolder();
        },

        async refresh() {
            await this.noteFolders();
        },

        async handleCreate() {
            this.$refs.newFolder.show();
        },

        async success(name) {
            try {
                if (!name) {
                    console.log("文件夹名字不能为空!")
                    return;
                }

                const newFolder = await GNote.folderCreate(name);

                this.$tips.message(`${name} 创建成功`);
                this.folders.push(newFolder);
            } catch (e) {
                this.$tips.message(JSON.stringify(e));
            }

        },

        selectedDefaultFolder() {
            this.$store.dispatch("folderChange", this.folders[0]);
        },

        cancle() {},

        handleDelete() {
            const selected = this.$store.getters.selectedFolder;
            if (!selected) {
                console.log("请选择文件夹");
                return;
            }

            //TODO: async/await
            this.$message({
                message: `删除:${selected.name}`
            }).then(async () => {
                try {
                    await GNote.folderDelete(selected.id);

                    for (var i = 0; i < this.folders.length; i++) {
                        if (this.folders[i] === selected)
                            break;
                    }
                    this.folders.splice(i, 1);

                    this.$store.dispatch("folderChange", null);
                } catch (e) {
                    this.$tips.message(JSON.stringify(e));
                } finally {
                    this.$tips.message("删除成功");
                }
            }).catch(e => {});
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
            <div title="新建文件夹" class="create-folder-btn" id="btn-folder-create" @click="handleCreate">
            </div>
            <div title="删除文件夹" class="delete-folder-btn" id="delete-folder-btn" @click="handleDelete">
            </div>
        </div>
        <modal-dialog ref="newFolder" title="新建文件夹" @cancle="cancle" @success="success"></modal-dialog>
    </div>
    `
}