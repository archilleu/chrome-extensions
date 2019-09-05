/**
 * google drive class
 * reference:
 *              https://developer.chrome.com/apps/app_identity
 *              https://developers.google.com/drive/api/v3/reference/
 */

class GDrive {
    constructor() {
        this.accessToken = null;

        this.DEFAULT_CHUNK_SIZE = 1024 * 1024 * 5;

        this.REST_FOLDER_CREATE = "https://www.googleapis.com/drive/v3/files";
        this.REST_FOLDER_DELETE = "https://www.googleapis.com/drive/v3/files/" /*fileId*/ ;
        this.REST_FOLDER_LIST = "https://www.googleapis.com/drive/v3/files";
        this.REST_FILE_CREATE_METADATA = "https://www.googleapis.com/drive/v3/files";
        this.REST_FILE_UPDATE_METADATA = "https://www.googleapis.com/drive/v3/files/" /*fileId*/ ;
        this.REST_FILE_DELETE = "https://www.googleapis.com/drive/v3/files/" /*fileId*/ ;
        this.REST_FILE_UPLOADCONTENT = "https://www.googleapis.com/upload/drive/v3/files/"; /*upload -> fileid +?uploadType=media or ...*/
        this.REST_FILE_GETCONTENT = "https://www.googleapis.com/drive/v3/files/"; /*download -> alt=media*/
        this.REST_FILE_CONTENT_UPLOADMEDIA = "?uploadType=media";

        //默认网络超时15s
        axios.defaults.timeout = 15000;
    }

    //创建文件夹
    createFolder(option) {
        const metadata = {
            name: option.name,
            parents: option.parents,
            mimeType: 'application/vnd.google-apps.folder'
        };
        axios.post(this.REST_FOLDER_CREATE, metadata).then((resp) => {
            option.success && option.success(resp.data);
        }).catch((error) => {
            this._axiosException(error, option);
        });
    }

    //删除文件夹
    deleteFolder(option) {
        axios.delete(this.REST_FOLDER_DELETE + option.id).then((resp) => {
            option.success && option.success(resp.data);
        }).catch((error) => {
            this._axiosException(error, option);
        });
    }

    //获取文件（夹）列表
    //https://developers.google.com/drive/api/v3/search-files
    /*;
    {
      corpora: corpora
      pageToken: pageToken,
      parents:[],
      fields: "files(id, name, modifiedTime, description)"
    }
    */
    list(option) {
        //默认获取云端硬盘根目录下面的文件(夹)
        let query = [];
        let parents = option.parents ? option.parents : ["root"];
        for (const parent of parents) {
            query.push('\"' + parent + '\"' + ' in parents');
        }
        const params = {
            corpora: option.corpora ? option.corpora : "user",
            orderBy: option.orderBy ? option.orderBy : "modifiedTime",
            q: query.join(" or ") + " and trashed=false",
            pageToken: option.pageToken ? option.pageToken : null,
            fields: option.fields ? option.fields : "files(id, name, modifiedTime, description)"
        }

        axios.get(this.REST_FOLDER_LIST, {
            params: params
        }).then((resp) => {
            option.success && option.success(resp.data.files);
        }).catch((error) => {
            this._axiosException(error, option);
        });
    }

    //创建文件元数据(不包含文件内容)
    createFileMetadata(option) {
        const metadata = {
            name: option.name,
            parents: option.parents ? option.parents : null,
            description: option.description,
            mimeType: "text/plain"
        }
        axios.post(this.REST_FILE_CREATE_METADATA, metadata).then((resp) => {
            option.success && option.success(resp.data);
        }).catch((error) => {
            this._axiosException(error, option);
        });
    }

    //删除文件
    deleteFile(option) {
        axios.delete(this.REST_FILE_DELETE + option.id).then((resp) => {
            option.success && option.success(resp.data);
        }).catch((error) => {
            this._axiosException(error, option);
        });
    }

    //上传文件内容
    uploadFileContent(option) {
        axios.patch(this.REST_FILE_UPLOADCONTENT + option.id + this.REST_FILE_CONTENT_UPLOADMEDIA, option.data, {
            headers: {
                "Content-Type": "text/plain"
            }
        }).then((resp) => {
            option.success && option.success(resp.data);
        }).catch((error) => {
            this._axiosException(error, option);
        });
    }

    //更新文件元数据
    updateFileMetadata(option) {
        const metadata = {
            parents: option.parents ? option.parents : null,
            name: option.name,
            description: option.description
        }
        axios.patch(this.REST_FILE_UPDATE_METADATA + option.id, metadata).then((resp) => {
            option.success && option.success(resp.data);
        }).catch((error) => {
            this._axiosException(error, option);
        });
    }

    //获取文件内容
    getFileContent(option) {
        const params = {
            alt: "media"
        }
        axios.get(this.REST_FILE_GETCONTENT + option.id, {
            params: params,
            responseType: 'text'
        }).then((resp) => {
            option.success && option.success(resp.data);
        }).catch((error) => {
            this._axiosException(error, option);
        });
    }

    _axiosException(error, option) {
        if (error.response) {
            option.error && option.error(error.response.data.error);
        } else if (error.request) {
            //网络不通
            option.neterror && option.neterror();
        } else {
            option.error && option.error(error);
        }
    }
}