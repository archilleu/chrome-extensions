/*
    gnode 文件（夹子)访问
*/

class GNode {
    constructor() {
        this.root = null; //GNode根目录
        this.gdrive = new GDrive();

        this.ROOT_NAME = "GNODE";
        this.DEFAULT_FOLDER_ALLNOTES = "全部便签";
    }

    init() {

    }

    //private

    //检查是否存在根目录,GNode的根目录是Google硬盘根目录下面一个GNODE文件夹
    _checkHasRootFolder(option) {
        this.gdrive.list({
            parents: ["root"],
            success: (data) => {
                const files = data.files;
                let found = false;
                for (const file of files) {
                    if (this.ROOT_NAME !== file.name) {
                        continue;
                    }

                    this.root = file.id;
                    found = true;
                    break;;
                }

                option.success && option.success(found);
            }
        });
    }

    //创建根目录
    _createRootFolder() {

    }
}