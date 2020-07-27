import GNote from "./gnote.js";

export default {
    data() {
        return {};
    },
    props: {
        note: {
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
            if (this.isSelectedNote)
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

            this.$store.dispatch("noteChange", this.note);
        },
    },
    computed: {
        isSelectedNote() {
            return this.note == this.$store.getters.selectedNote;
        },

        editorChange() {
            const editorChange = this.$store.getters.editorChange;
            if (!editorChange)
                return this.note.name;

            //判断是否当前选中的便签,变更仅仅针对当前选中的便签有效
            if (this.note != editorChange.note)
                return this.note.name;

            return editorChange.abstract;
        },

        saveNote() {
            return this.$store.getters.saveNote;
        }
    },
    filters: {
        formatDateTime(time) {
            return new Date(time).toLocaleString();
        }
    },

    watch: {
        editorChange(val) {
            return this.note.name = val;
        },

        //保存文件名变更
        async saveNote(val) {
            try {
                if (!this.isSelectedNote)
                    return;

                await GNote.noteSaveMetadata(this.note);
            } catch (e) {
                this.$tips.message(JSON.stringify(e));
            }
        }
    },

    template: `
        <div class="note-item" :data-id="note.id" :data-index="index" @click="handleClick" :class="{on: isSelectedNote}">
            <div class="item-status">
                <div class="time">{{ note.modifiedTime | formatDateTime }}</div>
                <div title="星标" class="fav"></div>
                <div class="image-note"></div>
            </div>
            <div class="note-title">
                <span>{{ note.name }}</span>
            </div>
        </div>
    `
}