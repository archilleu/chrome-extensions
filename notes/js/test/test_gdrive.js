import GAuth from '../api/gauth.js'
import config from '../http/config.js'
import GDrive from '../api/gdrive.js'

document.addEventListener('DOMContentLoaded', async () => {

    const root = "GTEST_" + Date.now();
    const fileName = "file.txt";
    const newFileName = "new-file.txt"
    const fileData = "hello,你好吗!";
    const fileDesc = "这是个测试描述";
    const newFileDesc = "new-这是个测试描述";
    let rootId = null;
    let fileId = null;

    let token = await GAuth.auth()
    config.setToken(token);

    debugger;

    await testCreateFolder();
    console.log("创建文件夹成功");

    await testCreateFile();
    console.log("创建文件成功");

    await testFileSearch();
    console.log("搜索文件夹成功");

    await testUploadFileContent();
    console.log("上传文件成功");

    await testUpdateFileMetadata();
    console.log("修改文件元数据成功");

    await testDeleteFile();
    console.log("删除文件成功");

    await testDeleteFolder();
    console.log("删除文件夹成功");

    //测试创建文件夹
    async function testCreateFolder() {
        const folder = await GDrive.folderCreate({
            name: root,
            parents: ["root"],

        });
        rootId = folder.id;

        const isExist = await testFileExist({
            parents: ["root"],
            name: root,
        });
        if (!isExist) {
            throw Error("创建文件夹失败")
        }

        return true;
    }

    //测试创建文件
    async function testCreateFile() {
        let file = await GDrive.fileMetadataCreate({
            name: fileName,
            parents: [rootId],
            description: fileDesc,
        });

        fileId = file.id;
        const isExist = await testFileExist({
            parents: [rootId],
            name: fileName,
            description: fileDesc,
        });

        if (!isExist) {
            throw Error("创建文件失败")
        }

        return true;
    }

    async function testFileSearch() {
        let res = await GDrive.search({
            name: fileName,
            parents: [rootId],
        });

        if (res.files.length != 1) {
            throw Error("搜索失败");
        }

        if (res.files[0].name != fileName) {

            throw Error("搜索失败");
        }

        res = await GDrive.search({
            name: root,
            parents: ["root"],
        });

        if (res.files.length != 1) {
            throw Error("搜索失败");
        }

        if (res.files[0].name != root) {

            throw Error("搜索失败");
        }

        return true;
    }

    //测试上传文件内容
    async function testUploadFileContent() {
        await GDrive.fileContentUpload({
            id: fileId,
            data: fileData,
        });

        const data = await GDrive.fileContent({
            id: fileId
        });
        if (data != fileData) {
            throw new Error("上传文件失败");
        }

        return true;
    }

    //测试修改文件metadata
    async function testUpdateFileMetadata() {
        const file = await GDrive.fileMetadataUpdate({
            id: fileId,
            name: newFileName,
            description: newFileDesc,
        });

        if (file.name != newFileName)
            throw new Error("文件metadata修改失败");

        return true;
    }

    //测试删除文件
    async function testDeleteFile() {
        await GDrive.fileDelete({
            id: fileId,
        });

        const isExist = await testFileExist({
            parents: [rootId],
            name: newFileName,
            description: fileDesc,
        });

        if (isExist) {
            throw Error("文件删除失败")
        }

        return true;
    }

    //测试删除文件夹
    async function testDeleteFolder() {
        GDrive.folderDelete({
            id: rootId,
        });

        const isExist = await testFileExist({
            parents: ["root"],
            name: root,
        });
        if (!isExist) {
            throw Error("删除文件夹失败")
        }

        return true;
    }

    async function testFileExist(option) {
        const res = await GDrive.list({
            parents: option.parents,
        });
        //检测是否存在
        let found = null;
        for (const file of res.files) {
            if (option.name == file.name) {
                found = file;
                break;
            }
        }
        if (!found)
            return false;

        return true;
    }
});