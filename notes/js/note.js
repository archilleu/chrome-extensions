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
        handleClick() {
            this.$store.dispatch("folderChange", this.folder);
        }
    },
    computed: {
        isSelectedFolder() {
            return this.folder == this.$store.getters.selectedFolder;
        }
    },

    template: `
        <div class="item-status">
            <div class="time">{{ note.modifiedTime}}</div>
            <div title="星标" class="fav"></div>
            <div class="image-note"></div>
        </div>
        <div class="note-title">
            <span>{{ note.name }}</span>
        </div>
    `
}