export default {
    name: "header-bar",
    data() {},
    props: {},
    methods: {},
    template: `
    <div class="titlebar">
        <span class="left">
            <img class="logo" src="images/note.png" alt="notes">
            <span class="logo">便签</span>
            <div class="btn-notes">
                <div title="刷新" class="btn-note btn-refresh" id="btn-refresh" click="refresh">
                    <div class="">
                        <span>
                            <i class="icon icon-refresh"></i>
                        </span>
                    </div>
                </div>
                <div title="保存便签" class="btn-note btn-save" id="btn-note-save" click="saveNote">
                    <div class="">
                        <span>
                            <i class="icon icon-save"></i>
                        </span>
                    </div>
                </div>
                <div title="创建便签" class="btn-note btn-create" id="btn-note-create" click="noteCreate">
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
                <div title="删除便签" class="btn-note btn-delete" id="btn-note-delete" click="noteDeleteDlg">
                    <div class="">
                        <span>
                            <i class="icon icon-delete"></i>
                        </span>
                    </div>
                </div>
                <div title="登出" class="btn-note btn-logout" id="btn-logout" click="logout">
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