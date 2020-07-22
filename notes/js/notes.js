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

            this.notes = await GNote.folderNotes(folder.id);
            this.selectedDefaultNote();
        }
    },

    components: {
        note
    },

    methods: {
        selectedDefaultNote() {
            if (this.notes.length > 0) {
                this.$store.dispatch("noteChange", this.notes[0]);
            }
        },
    },

    template: `
        <div class="note-list">
            <note v-for="(note, index) in notes" :key=note.id :note=note :index=index>
            </note>
        </div>
    `
}