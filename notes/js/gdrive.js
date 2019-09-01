/**
 * google drive class
 * reference:
 *            https://developer.chrome.com/apps/app_identity
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

  //请求google账户授权访问
  auth(option) {
    chrome.identity.getAuthToken({
      interactive: true
    }, (token) => {
      if (chrome.runtime.lastError) {
        option.error && option.error(chrome.runtime.lastError);
        return;
      }

      this.accessToken = token;
      axios.defaults.headers.common['Authorization'] = "Bearer " + token //配置axios请求授权头;
      option.success && option.success(token);
    });
  }

  //监测是否授权
  checkAuth() {
    return (null == this.accessToken ? false : true);
  }

  //remove cache auth
  removeCachedAuth(option) {

    //因为授权有可能丢失，所以先获取授权在取消授权缓存
    chrome.identity.getAuthToken({
      interactive: false
    }, (token) => {
      if (chrome.runtime.lastError) {
        option.error && option.error(chrome.runtime.lastError);
        return;
      }

      chrome.identity.removeCachedAuthToken({
          token: token
        },
        () => {
          option.success && option.success();
          this.accessToken = null;
        }
      );
    });

  }

  //revoke auth
  revokeAuth() {
    if (this.accessToken) {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + this.accessToken);
      xhr.send();
      this.removeCachedAuth();
    }
  }

   createFolder(settings) {
    const metadata = {
      name: settings.name,
      parents: settings.parents,
      mimeType: 'application/vnd.google-apps.folder'
    };
    $.ajax({
      type: "POST",
      url: this.REST_FOLDER_CREATE,
      contentType: 'application/json',
      data: JSON.stringify(metadata),
      beforeSend: (request) => {
        request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
      },
      success: (data) => {
        settings.success && settings.success(data);
      },
      error: (jqXHR, textStatus, errorTrown) => {
        this._error(jqXHR, textStatus, errorTrown, settings);
      }
    });
  }
  //创建文件夹
  createFolder1(option) {
    const metadata = {
      name: option.name,
      parents: option.parents,
      mimeType: 'application/vnd.google-apps.folder'
    };
    axios.post(this.REST_FOLDER_CREATE, {
      headers: {
         'Content-Type': 'application/json'
      },
      transformRequest: (data) => {
        return JSON.stringify(data);
      },
      data: metadata
    }).then((resp) => {
      option.success && option.success(resp.data);
    }).catch((error) => {
      this._axiosException(error, option);
    });
  }
  //delete folder
  deleteFolder(option) {
    const metadata = {
      trashed: true
    }
    $.ajax({
      type: "PATCH",
      url: this.REST_FILE_UPDATE_METADATA + option.folderId,
      contentType: 'application/json',
      data: JSON.stringify(metadata),
      beforeSend: (request) => {
        request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
      },
      success: (data) => {
        option.success && option.success(data);
      },
      error: (jqXHR, textStatus, errorTrown) => {
        this._error(jqXHR, textStatus, errorTrown, option);
      }
    });
    // $.ajax({
    //   type: "DELETE",
    //   url: this.REST_FOLDER_DELETE + option.folderId,
    //   beforeSend: (request) => {
    //     request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    //   },
    //   success: (data) => {
    //     option.success && option.success(data);
    //   },
    //   error: (jqXHR, textStatus, errorTrown) => {
    //     this._error(jqXHR, textStatus, errorTrown, option);
    //   }
    // });
  }

  //list
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
      option.success && option.success(resp.data);
    }).catch((error) => {
      this._axiosException(error, option);
    });
  }

  //create file fileMetadata
  createFileMetadata(option) {
    const metadata = {
      name: option.name,
      parents: option.parents ? option.parents : null,
      description: option.description,
      mimeType: "text/plain"
    }
    $.ajax({
      type: "POST",
      url: this.REST_FILE_CREATE_METADATA,
      contentType: 'application/json',
      data: JSON.stringify(metadata),
      beforeSend: (request) => {
        request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
      },
      success: (data) => {
        option.success && option.success(data);
      },
      error: (jqXHR, textStatus, errorTrown) => {
        this._error(jqXHR, textStatus, errorTrown, option);
      }
    });
  }

  //delete file
  deleteFile(option) {
    const metadata = {
      trashed: true
    }
    $.ajax({
      type: "PATCH",
      url: this.REST_FILE_UPDATE_METADATA + option.fileId,
      contentType: 'application/json',
      data: JSON.stringify(metadata),
      beforeSend: (request) => {
        request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
      },
      success: (data) => {
        option.success && option.success(data);
      },
      error: (jqXHR, textStatus, errorTrown) => {
        this._error(jqXHR, textStatus, errorTrown, option);
      }
    });
  }

  //create file metadata
  createFileContent(option) {
    $.ajax({
      type: "PATCH",
      url: this.REST_FILE_UPLOADCONTENT + option.fileId + this.REST_FILE_CONTENT_UPLOADMEDIA,
      data: option.data,
      beforeSend: (request) => {
        request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
      },
      success: (data) => {
        option.success && option.success(data);
      },
      error: (jqXHR, textStatus, errorTrown) => {
        this._error(jqXHR, textStatus, errorTrown, option);
      }
    });
  }

  //update file metadata
  updateFileMetadata(option) {
    const metadata = {
      parents: option.parents ? option.parents : null,
      name: option.name,
      description: option.description
    }
    $.ajax({
      type: "PATCH",
      url: this.REST_FILE_UPDATE_METADATA + option.fileId,
      contentType: 'application/json',
      data: JSON.stringify(metadata),
      beforeSend: (request) => {
        request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
      },
      success: (data) => {
        option.success && option.success(data);
      },
      error: (jqXHR, textStatus, errorTrown) => {
        this._error(jqXHR, textStatus, errorTrown, option);
      }
    });
  }

  //create file fileMetadata
  getFileContent(option) {
    const param = {
      alt: "media"
    }
    $.ajax({
      type: "GET",
      url: this.REST_FILE_GETCONTENT + option.fileId,
      data: param,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      dataType: option.mine ? option.mine : "text",
      beforeSend: (request) => {
        request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
      },
      success: (data) => {
        option.success && option.success(data);
      },
      error: (jqXHR, textStatus, errorTrown) => {
        this._error(jqXHR, textStatus, errorTrown, option);
      }
    });
  }

  _error(jqXHR, textStatus, errorTrown, option) {
    //net error
    if (0 == jqXHR.status) {
      option.neterror && option.neterror();
    } else if (401 == jqXHR.status) {
      option.e401 && option.e401();
    } else {
      option.error && option.error(jqXHR.status, jqXHR.responseJSON);
    }
  }

  _axiosException(error, option) {
    //网络不通
    if (!error.response || error.code === "ECONNABORTED") {
      option.neterror && option.neterror();
    } else {
      option.error && option.error(error.response.data.error);
    }
  }

}