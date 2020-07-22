/**
 * google drive
 * reference:
 *              https://developer.chrome.com/apps/app_identity
 *              https://developers.google.com/drive/api/v3/reference/
 * 使用前需要设置config 模块的 token
 */

import axios from '../http/axios.js'

export default {
    //创建文件夹
    folderCreate: async (option = {}) => {
        const metadata = {
            name: option.name,
            parents: option.parents,
            mimeType: 'application/vnd.google-apps.folder'
        };

        const url = "/drive/v3/files";
        return await axios({
            url: url,
            method: "post",
            data: metadata,
        });
    },

    //删除文件夹
    folderDelete: async (option = {}) => {
        const url = `/drive/v3/files/${option.id}`;
        return await axios({
            url: url,
            method: "delete",
        });
    },

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
    list: async (option = {}) => {
        //默认获取云端硬盘根目录下面的文件(夹)
        let query = [];
        let parents = option.parents ? option.parents : ["root"];
        for (const parent of parents) {
            query.push('\"' + parent + '\"' + ' in parents');
        }
        const params = {
            corpora: option.corpora ? option.corpora : "user",
            orderBy: option.orderBy ? option.orderBy : "modifiedTime desc",
            q: query.join(" or ") + " and trashed=false",
            pageToken: option.pageToken ? option.pageToken : null,
            fields: option.fields ? option.fields : "nextPageToken,files(id, name, modifiedTime, description)"
        };

        const url = "/drive/v3/files";
        return await axios({
            url: url,
            method: "get",
            params
        });
    },

    //按照文件名搜索文件
    search: async (option={})=> {
        //默认获取云端硬盘根目录下面的文件(夹)
        let query = [];
        let parents = option.parents ? option.parents : ["root"];
        for (const parent of parents) {
            query.push('\"' + parent + '\"' + ' in parents');
        }
        const params = {
            corpora: option.corpora ? option.corpora : "user",
            orderBy: option.orderBy ? option.orderBy : "modifiedTime",
            q: query.join(" or ") + ` and trashed=false and name='${option.name}'`,
            pageToken: option.pageToken ? option.pageToken : null,
            fields: option.fields ? option.fields : "nextPageToken,files(id, name, modifiedTime, description)"
        };

        const url = "/drive/v3/files";
        return await axios({
            url: url,
            method: "get",
            params
        });
    },

    //创建文件元数据(不包含文件内容)
    fileMetadataCreate: async (option = {}) => {
        const metadata = {
            name: option.name,
            parents: option.parents ? option.parents : null,
            description: option.description,
            mimeType: "text/plain"
        };

        const url = "/drive/v3/files";
        return await axios({
            url: url,
            method: "post",
            data: metadata
        });
    },

    //删除文件
    fileDelete: async (option = {}) => {
        const url = `/drive/v3/files/${option.id}`;
        return await axios({
            url: url,
            method: "delete",
        });
    },

    //上传文件内容
    fileContentUpload: async (option = {}) => {
        const url = `/upload/drive/v3/files/${option.id}?uploadType=media`;
        return await axios({
            url: url,
            method: "patch",
            data: option.data,
            headers: {
                "Content-Type": "text/plain"
            }
        });
    },

    //更新文件元数据
    fileMetadataUpdate: async (option = {}) => {
        const metadata = {
            parents: option.parents ? option.parents : null,
            name: option.name,
            description: option.description
        };

        const url = `/drive/v3/files/${option.id}`;
        return await axios({
            url: url,
            method: "patch",
            data: metadata
        });
    },

    //获取文件内容
    fileContent: async (option = {}) => {
        const params = {
            alt: "media"
        }
        const url = `/drive/v3/files/${option.id}`; /*download -> alt=media*/
        return await axios({
            url: url,
            method: "get",
            params,
            headers: {
                responseType: 'text'
            }
        });
    },

}