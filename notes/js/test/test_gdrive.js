document.addEventListener('DOMContentLoaded', () => {
    debugger;

    const root = "GTEST_" + Date.now();
    const fileName = "file.txt";
    const newFileName = "new-file.txt"
    const fileData = "hello,你好吗!";
    const fileDesc = "这是个测试描述";
    const newFileDesc = "new-这是个测试描述";
    let rootId = null;
    let fileId = null;

    const gdrive = new GDrive();
    const auth = new GAuth();

    auth.auth({
        success: () => {
            testGDrive();
        },
        error: () => {
            throw Error("auth failed!");
        }
    });

    function testGDrive() {

        testCreateFolder({
            success: (folder) => {
                testCreateFile({
                    success: (file) => {
                        //上传
                        testUploadFileContent({
                            success: () => {
                                testUpdateFileMetadata({
                                    success: () => {
                                        testDeleteFile({
                                            success: () => {}
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            },
        });
    }

    //测试创建文件夹
    function testCreateFolder(option) {
        gdrive.createFolder({
            name: root,
            parents: ["root"],
            success: (folder) => {
                rootId = folder.id;

                testFileExist({
                    parents: ["root"],
                    name: root,
                    success: () => {
                        console.info("文件夹测试通过");
                        option.success(folder);
                    }
                });
            },
            error: (error) => {
                throw new Error(error);
            },
            neterror: () => {
                throw new Error("net error");
            }
        });
    }

    //测试创建文件
    function testCreateFile(option) {
        gdrive.createFileMetadata({
            name: fileName,
            parents: [rootId],
            description: fileDesc,
            success: (file) => {
                fileId = file.id;
                testFileExist({
                    parents: [rootId],
                    name: fileName,
                    description: fileDesc,
                    success: () => {
                        console.info("文件测试通过");
                        option.success(file);
                    }
                });
            },
            error: (error) => {
                throw new Error(error);
            },
            neterror: () => {
                throw new Error("net error");
            }
        });
    }

    //测试上传文件内容
    function testUploadFileContent(option) {
        gdrive.uploadFileContent({
            id: fileId,
            data: fileData,
            success: (data) => {
                gdrive.getFileContent({
                    id: fileId,
                    success: (data) => {
                        if (data != fileData) {
                            throw new Error("上传文件失败");
                        }
                        console.log("文件上传测试成功");
                        option.success();
                    },
                    error: (error) => {
                        throw new Error(error);
                    },
                    neterror: () => {
                        throw new Error("net error");
                    }
                });
            },
            error: (error) => {
                throw new Error(error);
            },
            neterror: () => {
                throw new Error("net error");
            }
        });
    }

    //测试修改文件metadata
    function testUpdateFileMetadata(option) {
        gdrive.updateFileMetadata({
            id: fileId,
            name: newFileName,
            description: newFileDesc,
            success: (file) => {
                if (file.name != newFileName)
                    throw new Error("文件metadata修改失败");

                console.log("文件metadata修改成功");
                option.success();
            },
            error: (error) => {
                throw new Error(error);
            },
            neterror: () => {
                throw new Error("net error");
            }
        });
    }

    //测试删除文件
    function testDeleteFile(option) {
        gdrive.deleteFile({
            id: fileId,
            success: (file) => {
                console.log("删除文件成功");
                testDeleteFolder({
                    success: (folder) => {
                        console.log("删除文件夹成功");
                    }
                })
            },
            error: (error) => {
                throw new Error(error);
            },
            neterror: () => {
                throw new Error("net error");
            }
        });
    }

    //测试删除文件夹
    function testDeleteFolder(option) {
        gdrive.deleteFolder({
            id: rootId,
            success: (folder) => {
                console.log("删除文件夹成功");
            },
            error: (error) => {
                throw new Error(error);
            },
            neterror: () => {
                throw new Error("net error");
            }
        });
    }

    //测试获取文件夹列表
    function testFileExist(option) {
        gdrive.list({
            parents: option.parents,
            success: (files) => {
                //检测是否存在
                let found = null;
                for (const file of files) {
                    if (option.name == file.name) {
                        found = file;
                        break;
                    }
                }
                if (!found)
                    throw new Error("测试文件不正确")

                if (option.description) {
                    if (option.description != found.description)
                        throw new Error("测试文件夹不正确")
                }

                option.success();
            },
            error: (error) => {
                throw new Error(error);
            },
            neterror: () => {
                throw new Error("net error");
            }
        });
    }
});