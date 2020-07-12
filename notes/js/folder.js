export default {
    data() {},
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
            store.dispatch("folderChange", this.folder);
        }
    },
    template: `
    <div class="folder-item" :data-id="folder.id" :data-index="index" @click="handleClick">
        <div class="folder-icon all-icon"></div>
        <div class="folder-name">{{ folder.name }}</div>
        <div class="folder-info">{{ folder.info }}</div>
    </div>
    `
}