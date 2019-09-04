/*
    gnode 文件（夹子)访问
*/

class GNode {
    constructor() {
        this.root = null; //GNode根目录
        this.gdrive = new GDrive();

        this.ROOT_NAME = "GNODE";
        this.DEFAULT_FOLDER_MYNOTES = "我的便签";
    }

    //初始化
    init(option) {
        this._checkHasRootFolder({
            success: (id) => {
                //根目录存在，检测是否存在默认文件夹
                if (id) {
                    this.root = id;
                    this._checkHasMyNotesFolder({
                        success: (id) => {
                            if (id) {
                                //默认文件夹存在,回调成功
                                option.success && option.success();
                            } else {
                                //创建默认文件夹
                                this._createDefaultFolder(option);
                            }
                        }
                    });
                } else {
                    //创建根目录
                    this._createRootFolder(option);
                }
            },
            error: (error) => {
                option.error && option.error(error);
            },
            neterror: () => {
                option.neterror && option.neterror();
            }
        });
    }

    //获取便签文件夹列表
    NodeFolders(option) {
        this.gdrive.list({
            parents: [this.root],
            orderBy: "modifiedTime",
            success: (folders) => {
                //默认文件夹排在第一位
                let firstFolder = null;
                let sortdFolders = new Array();
                for (let folder of folders) {
                    if (folder.name === this.DEFAULT_FOLDER_MYNOTES) {
                        firstFolder = folder;
                    } else {
                        sortdFolders.unshift(folder)
                    }
                }
                sortdFolders.unshift(firstFolder);

                option.success && option.success(sortdFolders);
                option.finaly && option.finaly();
            },
            error: (error) => {
                option.error && option.error(error);
                option.finaly && option.finaly();
            },
            neterror: () => {
                option.neterror && option.neterror();
                option.finaly && option.finaly();
            },
        });
    }

    /**
     * private
     */

    //检测是否存在根目录,GNode的根目录是Google硬盘根目录下面一个GNODE文件夹
    _checkHasRootFolder(option) {
        option.name = this.ROOT_NAME;
        option.parents = ["root"];
        this._checkHasFolder(option);
    }

    //检测是否存在我的便签（默认不可删除的一个便签)
    _checkHasMyNotesFolder(option) {
        option.name = this.DEFAULT_FOLDER_MYNOTES;
        option.parents = [this.root];
        this._checkHasFolder(option);
    }

    //检测是否存在某个文件夹
    _checkHasFolder(option) {
        this.gdrive.list({
            parents: option.parents,
            success: (files) => {
                let found = null;
                for (const file of files) {
                    if (option.name !== file.name) {
                        continue;
                    }

                    found = file.id;
                    break;;
                }

                option.success && option.success(found);
            },
            error(error) {
                option.error && option.error(error);
            },
            neterror() {
                option.neterror && option.neterror();
            }
        });
    }

    //创建根目录
    _createRootFolder(option) {
        this.gdrive.createFolder({
            name: this.ROOT_NAME,
            parents: ["root"],
            success: (data) => {
                this.root = data.id;
                this._createDefaultFolder(option);
            },
            error: (error) => {
                option.error && option.error(error);
            },
            neterror: () => {
                option.neterror && option.neterror();
            },
        });
    }

    //创建默认文件夹
    _createDefaultFolder(option) {
        this.gdrive.createFolder({
            name: this.DEFAULT_FOLDER_MYNOTES,
            parents: [this.root],
            success: (data) => {
                option.success && option.success(data);
            },
            error: (error) => {
                option.error && option.error(error);
            },
            neterror: () => {
                option.neterror && option.neterror();
            },
        });
    }
}