import note from "./note.js"
import GNote from "./gnote.js"

export default {
    data() {
        return {
            notes: [

                {
                    modifiedTime: null,
                    name: null
                }
            ],
        }
    },

    components: {
        note
    },

    methods: {
        //获取便签文件夹列表
        async noteFolders() {
            this.folders = await GNote.noteFolders();
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

                this.$loading.show();

                const newFolder = await GNote.folderCreate(name);

                this.$tips.message(`${name} 创建成功`);
                this.folders.push(newFolder);
            } catch (e) {
                this.$tips.message(JSON.stringify(e));
            } finally {
                this.$loading.hide();
            }

        },
        cancle() {},

        handleDelete() {
            const selected = this.$store.getters.selectedFolder;
            if (!selected) {
                console.log("请选择文件夹");
                return;
            }

            this.$message({
                message: `删除:${selected.name}`
            }).then(async () => {
                try {
                    this.$loading.show();

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
                    this.$loading.hide();
                    this.$tips.message("删除成功");
                }
            }).catch(e => {});
        },

    },

    template: `
        <div class="notes">
            <note v-for="(note, index) in notes" :key=note.id :note=note :index=note.id>
            </note>
        </div>
    `
}