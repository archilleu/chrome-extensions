/*
    gnode 文件（夹子)访问
*/
import GAuth from "./api/gauth.js"
import GDrive from "./api/gdrive.js"
import config from "./http/config.js"

export default {
    data: {
        rootId: null, //根目录ID
        ROOT_NAME: "GNODE1", //根目录名字
        DEFAULT_FOLDER_MYNOTES: "我的便签", //默认便签文件夹名字
    },

    async init() {
        const token = await GAuth.auth();
        config.setToken(token);

        await this._initRootFolder();

        await this._initDefaultFolder();
    },

    //获取便签文件夹列表
    async noteFolders() {
        const res = await GDrive.list({
            parents: [this.data.rootId],
            orderBy: "modifiedTime desc",
        });

        //默认文件夹排在第一位
        let firstFolder = null;
        let sortdFolders = new Array();
        for (let folder of res.files) {
            if (folder.name === this.data.DEFAULT_FOLDER_MYNOTES) {
                firstFolder = folder;
            } else {
                sortdFolders.unshift(folder)
            }
        }
        sortdFolders.unshift(firstFolder);

        return sortdFolders;
    },

    //初始化默认根目录
    async _initRootFolder() {
        //查找根目录是否存在
        const res = await GDrive.search({
            name: this.data.ROOT_NAME,
            parents: ["root"],
        });

        //不存在创建根目录
        if (res.files.length == 0) {
            const file = await GDrive.folderCreate({
                name: this.data.ROOT_NAME,
                parents: ["root"],
            });
            this.data.rootId = file.id;
            return true;
        }

        this.data.rootId = res.files[0].id;
        return true;
    },

    //初始化默认文件夹
    async _initDefaultFolder() {

        //查找默认文件夹是否存在
        const res = await GDrive.search({
            name: this.data.DEFAULT_FOLDER_MYNOTES,
            parents: [this.data.rootId],
        });

        //不存在创建默认文件夹
        if (res.files.length == 0) {
            await GDrive.folderCreate({
                name: this.data.DEFAULT_FOLDER_MYNOTES,
                parents: [this.data.rootId],
            });
        }

        return true;
    },
}

class GNote {
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
                option.error && option.error(this._formatError(error));
            },
            neterror: () => {
                option.neterror && option.neterror();
            }
        });
    }

    //获取便签文件夹列表
    noteFolders(option) {
        this.gdrive.list({
            parents: [this.root],
            orderBy: "modifiedTime desc",
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
                option.error && option.error(this._formatError(error));
                option.finaly && option.finaly();
            },
            neterror: () => {
                option.neterror && option.neterror();
                option.finaly && option.finaly();
            },
        });
    }

    //获取便签文件夹下的便签列表
    noteFolderNotes(option) {
        this.gdrive.list({
            parents: [option.parent],
            orderBy: "modifiedTime desc",
            success: (notes) => {
                option.success && option.success(notes);
                option.finaly && option.finaly();
            },
            error: (error) => {
                option.error && option.error(this._formatError(error));
                option.finaly && option.finaly();
            },
            neterror: () => {
                option.neterror && option.neterror();
                option.finaly && option.finaly();
            },
        });
    }

    //创建便签文件夹
    noteFolderCreate(option) {
        this.gdrive.createFolder({
            parents: [this.root],
            name: option.name,
            success: (folder) => {
                option.success && option.success(folder);
                option.finaly && option.finaly();
            },
            error: (error) => {
                option.error && option.error(this._formatError(error));
                option.finaly && option.finaly();
            },
            neterror: () => {
                option.neterror && option.neterror();
                option.finaly && option.finaly();
            }
        });
    }

    //删除文件夹
    noteFolderDelete(option) {
        this.gdrive.deleteFolder({
            id: option.id,
            success: () => {
                option.success && option.success();
                option.finaly && option.finaly();
            },
            error: (error) => {
                option.error && option.error(this._formatError(error));
                option.finaly && option.finaly();
            },
            neterror: () => {
                option.neterror && option.neterror();
                option.finaly && option.finaly();
            }
        });
    }

    //创建便签
    noteCreate(option) {
        this.gdrive.createFileMetadata({
            parents: [option.parent],
            name: option.name,
            description: option.description,
            success: (note) => {
                option.success && option.success(note);
                option.finaly && option.finaly();
            },
            error: (error) => {
                option.error && option.error(this._formatError(error));
                option.finaly && option.finaly();
            },
            neterror: () => {
                option.neterror && option.neterror();
                option.finaly && option.finaly();
            }
        });
    }

    //更新便签
    noteSave(option) {
        //更新便签元数据
        this.gdrive.updateFileMetadata({
            id: option.id,
            name: option.name,
            description: option.description,
            success: (note) => {
                //上传便签内容
                this.gdrive.uploadFileContent({
                    id: option.id,
                    data: option.data,
                    success: (file) => {
                        option.success && option.success(file);
                        option.finaly && option.finaly();
                    },
                    error: (error) => {
                        option.error && option.error(this._formatError(error));
                        option.finaly && option.finaly();
                    },
                    neterror: () => {
                        option.neterror && option.neterror();
                        option.finaly && option.finaly();
                    }
                });
            },
            error: (error) => {
                option.error && option.error(this._formatError(error));
                option.finaly && option.finaly();
            },
            neterror: () => {
                option.neterror && option.neterror();
                option.finaly && option.finaly();
            }
        });
    }

    //删除便签
    noteDelete(option) {
        this.gdrive.deleteFile({
            id: option.id,
            success: () => {
                option.success && option.success();
                option.finaly && option.finaly();
            },
            error: (error) => {
                option.error && option.error(this._formatError(error));
                option.finaly && option.finaly();
            },
            neterror: () => {
                option.neterror && option.neterror();
                option.finaly && option.finaly();
            }
        });
    }

    //获取便签内容
    getNoteData(option) {
        this.gdrive.getFileContent({
            id: option.id,
            success: (data) => {
                option.success && option.success(data);
                option.finaly && option.finaly();
            },
            error: (error) => {
                option.error && option.error(this._formatError(error));
                option.finaly && option.finaly();
            },
            neterror: () => {
                option.neterror && option.neterror();
                option.finaly && option.finaly();
            }
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
                option.error && option.error(this._formatError(error));
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
                option.error && option.error(this._formatError(error));
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
                option.error && option.error(this._formatError(error));
            },
            neterror: () => {
                option.neterror && option.neterror();
            },
        });
    }

    //格式化错误
    _formatError(error) {
        return error.message + " " + error.code;
    }
}