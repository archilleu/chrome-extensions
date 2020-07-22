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
            this.$store.dispatch("noteChange", this.note);
        }
    },
    computed: {
        isSelectedNote() {
            return this.note == this.$store.getters.selectedNote;
        }
    },
    filters: {
        formatDateTime(time) {
            return new Date(time).toLocaleString();
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