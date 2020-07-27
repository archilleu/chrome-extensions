import GNote from "./gnote.js";

export default {
    data() {
        return {};
    },
    props: {
        folder: {
            type: Object,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
    },
    methods: {
        async handleClick() {
            if (this.isSelectedFolder)
                return;

            const editorChange = this.$store.getters.editorChange;
            if (editorChange) {
                try {
                    await this.$message({
                        message: "当前便签内容改变，需要保存吗？"

                    });
                    await GNote.noteSaveMetadata(editorChange.note);
                    await GNote.noteSave(editorChange.note.id, editorChange.data);
                    this.$tips.message("保存成功");
                } catch (e) {
                    if ("cancle" == e)
                        return;
                    this.$tips.message(JSON.stringify(e));
                }
            }

            this.$store.dispatch("folderChange", this.folder);
        }
    },
    computed: {
        isSelectedFolder() {
            return this.folder == this.$store.getters.selectedFolder;
        }
    },

    template: `
    <div class="folder-item" :class="{on:isSelectedFolder}" :data-id="folder.id" :data-index="index" @click="handleClick">
        <div class="folder-icon all-icon"></div>
        <div class="folder-name">{{ folder.name }}</div>
        <div class="folder-info">{{ folder.info }}</div>
    </div>
    `
}