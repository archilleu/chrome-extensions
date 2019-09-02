/*
    gnode 文件（夹子)访问
*/

class GNode {
    constructor() {
        this.root = null; //GNode根目录
        this.gdrive = new GDrive();

        this.ROOT_NAME = "GNODE1";
        this.DEFAULT_FOLDER_MYNOTES = "我的便签";
    }

    //初始化
    init(option) {
        this._checkHasRootFolder({
            success: (result) => {
                //根目录存在，检测是否存在默认文件夹
                if (result) {
                    this._checkHasMyNotesFolder({
                        success: (result) => {
                            //默认文件夹存在,回调成功
                            if (result) {
                                option.success && option.success();
                            } else {
                                //创建默认文件夹
                                this.gdrive.createFolder({
                                    name: this.DEFAULT_FOLDER_MYNOTES,
                                    parents: [this.root],
                                    success: (data) => {
                                        option.success && option.success();
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
                    });
                } else {
                    //创建根目录
                    this.gdrive.createFolder({
                        name: this.ROOT_NAME,
                        parents: ["root"],
                        success: (data) => {
                            this.root = data.id;
                            //创建默认文件夹
                            this.gdrive.createFolder({
                                name: this.DEFAULT_FOLDER_MYNOTES,
                                parents: [this.root],
                                success: (data) => {
                                    option.success && option.success();
                                },
                                error: (error) => {
                                    option.error && option.error(error);
                                },
                                neterror: () => {
                                    option.neterror && option.neterror();
                                },
                            });
                        },
                        error: (error) => {
                            option.error && option.error(error);
                        },
                        neterror: () => {
                            option.neterror && option.neterror();
                        },
                    });
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

    /**
     * private
     */

    //检测是否存在根目录,GNode的根目录是Google硬盘根目录下面一个GNODE文件夹
    _checkHasRootFolder(option) {
        option.name = this.ROOT_NAME;
        this._checkHasFolder(option);
    }

    //检测是否存在我的便签（默认不可删除的一个便签)
    _checkHasMyNotesFolder(option) {
        option.name = this.DEFAULT_FOLDER_MYNOTES;
        this._checkHasFolder(option);
    }

    //检测是否存在某个文件夹
    _checkHasFolder(option) {
        this.gdrive.list({
            parents: ["root"],
            success: (data) => {
                const files = data.files;
                let found = false;
                for (const file of files) {
                    if (option.name !== file.name) {
                        continue;
                    }

                    this.root = file.id;
                    found = true;
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
        option.name = this.ROOT_NAME;
        option.parents = "root";
        this.gdrive.createFolder(option);
    }

    //创建默认文件夹
    _createMyNodeFolder(option) {
        option.name = this.ROOT_NAME;
        option.parents = "root";
        this.gdrive.createFolder(option);
    }
}