import note from "./note.js"
import GNote from "./gnote.js"

export default {
    data() {
        return {
            notes: [],
        }
    },

    computed: {
        folderChange() {
            const folder = this.$store.getters.selectedFolder;
            return folder;
        },
    },

    watch: {
        async folderChange(folder) {
            if (!folder)
                return [];

            try {
                this.notes = await GNote.folderNotes(folder.id);
                this.selectedDefaultNote();
            } catch (e) {
                this.$tips.message(JSON.stringify(e));
            }
        }
    },

    components: {
        note
    },

    methods: {
        selectedDefaultNote() {
            if (this.notes.length > 0) {
                this.$store.dispatch("noteChange", this.notes[0]);
            } else {
                this.$store.dispatch("noteChange", null);
            }
        },

        async deleteNote() {
            const selectedNote = this.$store.getters.selectedNote;
            if (!selectedNote) {
                this.$tips.message("请选择便签");
                return;
            }

            try {
                await this.$message({
                    message: `删除:${selectedNote.name}`
                });

                await GNote.noteDelete(selectedNote.id);

                for (let i = 0; i < this.notes.length; i++) {
                    if (this.notes[i] == selectedNote) {
                        this.notes.splice(i, 1);
                        break;
                    }
                }

                if (this.notes.length > 0) {
                    this.$store.dispatch("noteChange", this.notes[0]);
                }
            } catch (e) {
                if (e == "cancle")
                    return;

                this.$tips.message(JSON.stringify(e));
            }
        }
    },

    template: `
        <div class="note-list">
            <note v-for="(note, index) in notes" :key=note.id :note=note :index=index>
            </note>
        </div>
    `
}