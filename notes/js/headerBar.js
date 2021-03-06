/**
 * 头部模块
 * TODO:部分功能放回notes
 */
import GNote from "./gnote.js"
import auth from "./api/gauth.js"

export default {
    name: "header-bar",
    data() {},
    props: {},
    methods: {
        async refresh() {
            try {
                await this.folders.noteFolders();
                this.$tips.message("刷新成功");
            } catch (e) {
                this.$tips.message(JSON.stringify(e));
            }
        },

        async createNote() {
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
                    if ("cancle" != e)
                    this.$tips.message(JSON.stringify(e));
                }
            }

            const selectedFolder = this.$store.getters.selectedFolder;
            if (!selectedFolder) {
                this.$tips.message("请选择便签文件夹");
                return;
            }

            try {
                const note = await GNote.noteCreate(selectedFolder.id);
                this.$tips.message("新建便签成功");

                //添加到便签列表
                this.append2Notes(note);

                this.selectedNewNote(note);
            } catch (e) {
                this.$tips.message(JSON.stringify(e));
            }
        },

        saveNote() {
            const selectedNote = this.$store.getters.selectedNote;
            if (!selectedNote) {
                this.$tips.message("请选择便签");
                return;
            }

            this.$store.dispatch("saveNote");
        },

        async deleteNote() {
            await this.notes.deleteNote();
        },

        async logout() {
            try {
                await this.$message({
                    message: "确定登出？"

                });
                await auth.removeCachedAuth();
                window.location.href = chrome.extension.getURL('login.html');
            } catch (e) {}
        },

        append2Notes(note) {
            note.modifiedTime = new Date();
            this.notes.notes.unshift(note);
        },

        selectedNewNote(note) {
            this.$store.dispatch("noteChange", note);
        }
    },
    computed: {
        folders() {
            return this.$parent.$refs.folders;
        },
        notes() {
            return this.$parent.$refs.notes;
        },
        editor() {
            return this.$parent.$refs.editor;
        }
    },
    template: `
    <div class="titlebar">
        <span class="left">
            <img class="logo" src="images/note.png" alt="notes">
            <span class="logo">便签</span>
            <div class="btn-notes">
                <div title="刷新" class="btn-note btn-refresh" id="btn-refresh" @click="refresh">
                    <div class="">
                        <span>
                            <i class="icon icon-refresh"></i>
                        </span>
                    </div>
                </div>
                <div title="保存便签" class="btn-note btn-save" id="btn-note-save" @click="saveNote">
                    <div class="">
                        <span>
                            <i class="icon icon-save"></i>
                        </span>
                    </div>
                </div>
                <div title="创建便签" class="btn-note btn-create" id="btn-note-create" @click="createNote">
                    <div class="">
                        <span>
                            <i class="icon icon-create"></i>
                        </span>
                    </div>
                </div>
            </div>
        </span>
        <span class="right">
            <div class="btn-notes">
                <div title="插入图片" class="btn-note btn-insertImage">
                    <div class="">
                        <span>
                            <i class="icon icon-insertImage"></i>
                        </span>
                    </div>
                </div>
                <div title="移动便签" class="btn-note btn-moveNote">
                    <div class="">
                        <span>
                            <i class="icon icon-moveNote"></i>
                        </span>
                    </div>
                </div>
                <div title="删除便签" class="btn-note btn-delete" id="btn-note-delete" @click="deleteNote">
                    <div class="">
                        <span>
                            <i class="icon icon-delete"></i>
                        </span>
                    </div>
                </div>
                <div title="登出" class="btn-note btn-logout" id="btn-logout" @click="logout">
                    <div class="">
                        <span>
                            <i class="icon icon-logout"></i>
                        </span>
                    </div>
                </div>
            </div>
        </span>
    </div>
    `
}