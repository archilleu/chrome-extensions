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
    <div class="folder-item" :class="{on:isSelectedFolder}" :data-id="folder.id" :data-index="index" @click="handleClick">
        <div class="folder-icon all-icon"></div>
        <div class="folder-name">{{ folder.name }}</div>
        <div class="folder-info">{{ folder.info }}</div>
    </div>
    `
}