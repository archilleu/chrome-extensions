/**
 * google drive class
 * reference:
 *            https://developer.chrome.com/apps/app_identity
 */

class GDrive {

  constructor() {
    this.accessToken = null;

    this.__defineGetter__("DEFAULT_CHUNK_SIZE", function() {
      return 1024 * 1024 * 5; // 5MB;
    });

    this.__defineGetter__("REST_FOLDER_CREATE", function() {
      return "https://www.googleapis.com/drive/v3/files";
    })

    this.__defineGetter__("REST_FOLDER_DELETE", function() {
      return "https://www.googleapis.com/drive/v3/files/" /*fileId*/ ;
    })

    this.__defineGetter__("REST_FOLDER_LIST", function() {
      return "https://www.googleapis.com/drive/v3/files";
    })

    this.__defineGetter__("REST_FILE_CREATE_METADATA", function() {
      return "https://www.googleapis.com/drive/v3/files";
    })

    this.__defineGetter__("REST_FILE_UPDATE_METADATA", function() {
      return "https://www.googleapis.com/drive/v3/files/" /*fileId*/ ;
    })

    this.__defineGetter__("REST_FILE_DELETE", function() {
      return "https://www.googleapis.com/drive/v3/files/" /*fileId*/ ;
    })

    this.__defineGetter__("REST_FILE_UPLOADCONTENT", function() {
      /*
       * upload -> fileid +?uploadType=media or ...
       */
      return "https://www.googleapis.com/upload/drive/v3/files/";
    })

    this.__defineGetter__("REST_FILE_GETCONTENT", function() {
      /*
       * download -> alt=media
       */
      return "https://www.googleapis.com/drive/v3/files/";
    })

    this.__defineGetter__("REST_FILE_CONTENT_UPLOADMEDIA", function() {
      return "?uploadType=media";
    })
  }

  //init
  init(settings) {
    chrome.identity.getAuthToken({
      interactive: false
    }, (token) => {
      if (chrome.runtime.lastError) {
        settings.error && settings.error(chrome.runtime.lastError);
        return;
      }

      this.accessToken = token;
      settings.success && settings.success();
    });
  }

  //auth
  checkAuth() {
    return (null == this.accessToken ? false : true);
  }

  //auth
  auth(settings) {
    chrome.identity.getAuthToken({
      interactive: true
    }, (token) => {
      if (chrome.runtime.lastError) {
        settings.error && settings.error(chrome.runtime.lastError);
        return;
      }

      this.accessToken = token;
      settings.success && settings.success();
    });
  }

  //remove cache auth
  removeCachedAuth(settings) {

    chrome.identity.getAuthToken({
      interactive: false
    }, (token) => {
      if (chrome.runtime.lastError) {
        settings.error && settings.error(chrome.runtime.lastError);
        return;
      }

      chrome.identity.removeCachedAuthToken({
          token: token
        },
        () => {
          settings.success && settings.success();
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

  //create folder
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

  //delete folder
  deleteFolder(settings) {
    const metadata = {
      trashed: true
    }
    $.ajax({
      type: "PATCH",
      url: this.REST_FILE_UPDATE_METADATA + settings.folderId,
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
    // $.ajax({
    //   type: "DELETE",
    //   url: this.REST_FOLDER_DELETE + settings.folderId,
    //   beforeSend: (request) => {
    //     request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    //   },
    //   success: (data) => {
    //     settings.success && settings.success(data);
    //   },
    //   error: (jqXHR, textStatus, errorTrown) => {
    //     this._error(jqXHR, textStatus, errorTrown, settings);
    //   }
    // });
  }

  //list
  /*;
  {
    corpora: corpora
    pageToken: pageToken,
    parents:[],
    fields: "files(id, name, modifiedTime, description)"
  }
  */
  list(settings) {

    let parents = settings.parents ? settings.parents : ["root"];
    let query = [];
    for (const parent of parents) {
      query.push('\"' + parent + '\"' + ' in parents');
    }
    const parameter = {
      corpora: settings.corpora ? settings.corpora : "user",
      orderBy: settings.orderBy,
      q: query.join(" or ") + " and trashed=false",
      pageToken: settings.pageToken ? settings.pageToken : null,
      fields: settings.fields ? settings.fields : "files(id, name, modifiedTime, description)"
    }
    $.ajax({
      type: "GET",
      url: this.REST_FOLDER_LIST,
      data: parameter,
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

  //create file fileMetadata
  createFileMetadata(settings) {
    const metadata = {
      name: settings.name,
      parents: settings.parents ? settings.parents : null,
      description: settings.description,
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
        settings.success && settings.success(data);
      },
      error: (jqXHR, textStatus, errorTrown) => {
        this._error(jqXHR, textStatus, errorTrown, settings);
      }
    });
  }

  //delete file
  deleteFile(settings) {
    const metadata = {
      trashed: true
    }
    $.ajax({
      type: "PATCH",
      url: this.REST_FILE_UPDATE_METADATA + settings.fileId,
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

  //create file metadata
  createFileContent(settings) {
    $.ajax({
      type: "PATCH",
      url: this.REST_FILE_UPLOADCONTENT + settings.fileId + this.REST_FILE_CONTENT_UPLOADMEDIA,
      data: settings.data,
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

  //update file metadata
  updateFileMetadata(settings) {
    const metadata = {
      parents: settings.parents ? settings.parents : null,
      name: settings.name,
      description: settings.description
    }
    $.ajax({
      type: "PATCH",
      url: this.REST_FILE_UPDATE_METADATA + settings.fileId,
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

  //create file fileMetadata
  getFileContent(settings) {
    const param = {
      alt: "media"
    }
    $.ajax({
      type: "GET",
      url: this.REST_FILE_GETCONTENT + settings.fileId,
      data: param,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      dataType: settings.mine ? settings.mine : "text",
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

  _error(jqXHR, textStatus, errorTrown, settings) {
    //net error
    if (0 == jqXHR.status) {
      settings.neterror && settings.neterror();
    } else if (401 == jqXHR.status) {
      settings.e401 && settings.e401();
    } else {
      settings.error && settings.error(jqXHR.status, jqXHR.responseJSON);
    }
  }

}