import GNote from "./gnote.js"

export default {
    data() {
        return {
            editor: null,
            data: null,
            now: new Date().toLocaleString()
        };
    },
    computed: {
        selectedFolderName() {
            const folder = this.$store.getters.selectedFolder;
            if (!folder)
                return "";

            return folder.name;
        },

        textCount() {
            return 0;
        },

        selectedNote() {
            const note = this.$store.getters.selectedNote;
            return note;
        },

        saveNote() {
            return this.$store.getters.saveNote;
        }
    },

    watch: {
        async selectedNote(note) {
            if (!note) {
                this.data = null;
                return;
            }

            try {
                this.data = await GNote.noteContent(note.id);

                //有可能输入是纯数字
                if (!isNaN(this.data)) {
                    this.data = this.data.toString();
                }
                this.editor.setValue(this.data);
            } catch (e) {
                this.$tips.message(JSON.stringify(e));
            }
        },

        async saveNote() {
            try {
                await GNote.noteSave(this.selectedNote.id, this.data);
                this.$store.dispatch("editorChange", null);
                this.$tips.message("保存成功");
            } catch (e) {
                this.$tips.message(JSON.stringify(e));
            }
        },
    },
    methods: {},
    mounted() {
        this.editor = CodeMirror.fromTextArea(document.querySelector("#codemirror-editor"), {
            tabSize: 4,
            scrollbarStyle: "simple",
            cursorHeight: 0.40,
            extraKeys: {
                /*
                "Esc": function() {
                }
                */
            },
        });

        this.editor.on("change", (codemirror) => {
            //如果是选择便签导致editr内容改变的，则认为逻辑上没有改变
            const data = codemirror.getValue();
            if (this.data == data) {
                this.$store.dispatch("editorChange", null);
                return;
            }
            this.data = data;
            const abstract = this.data.substr(0, 25);

            const selectedNote = this.$store.getters.selectedNote;
            if (!selectedNote)
                return;

            this.$store.dispatch("editorChange", {
                note: selectedNote,
                data: this.data,
                abstract: abstract,
            });
        });
    },

    template: `
    <div class="edit-wrapper">
        <div class="edit-status">
            <i class="edge"></i>
            <div class="edit-mode">纯文本模式</div>
            <div class="status-bar">
                <div class="folder">
                    <span>{{ selectedFolderName }}</span>
                    <i></i>
                </div>
                <span class="split-line"></span>
                <span class="time">{{ now }}</span>
                <span class="split-line"></span>
                <span class="counter">共 {{ textCount }} 字</span>
                <span class="split-line"></span>
                <span class="favorite"></span>
            </div>
        </div>
        <div class="edit-main">
            <i></i>
            <div class="edit-area" id="edit-area">
                <div class="edge"></div>
                <div class="note-editor" id="note-editor">
                    <textarea id='codemirror-editor' style='display: none;'></textarea>
                </div>
            </div>
        </div>
    </div>
    `
}