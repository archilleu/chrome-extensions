/**
 * google drive class
 * reference:
 *            https://developer.chrome.com/apps/app_identity
 */

//Todo 更改调用为jquery方式

function GDrive() {
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
GDrive.prototype.init = function(callback) {
  try {
    chrome.identity.getAuthToken({
      interactive: false
    }, function(token) {
      if (chrome.runtime.lastError) {
        callback && callback(chrome.runtime.lastError);
        return;
      }

      if (token) {
        callback && callback("success");
      }
    }.bind(this));
  } catch (e) {
    console.error(e);
  }
}

//auth
GDrive.prototype.checkAuth = function(callback) {
  return (null == this.accessToken ? false : true);
}

//auth
GDrive.prototype.auth = function(callback) {
  try {
    chrome.identity.getAuthToken({
      interactive: true
    }, function(token) {
      if (chrome.runtime.lastError) {
        callback && callback(chrome.runtime.lastError.message);
        return;
      }

      if (token) {
        this.accessToken = token;
        callback && callback(null);
      }
    }.bind(this));
  } catch (e) {
    console.error(e);
  }
}

//remove cache auth
GDrive.prototype.removeCachedAuth = function(callback) {
  if (null == this.accessToken) {
    callback && callback();
    return;
  }

  const accessToken = this.accessToken;
  this.accessToken = null;

  chrome.identity.removeCachedAuthToken({
      token: accessToken
    },
    function() {
      callback && callback();
    }
  );
}

//revoke auth
GDrive.prototype.revokeAuth = function() {
  if (this.accessToken) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + this.accessToken);
    xhr.send();
    this.removeCachedAuth();
  }
}

//create folder
GDrive.prototype.createFolder = function(parent, name, callback) {
  if (null == this.accessToken) {
    callback && callback({
      message: "token is null",
      data: null
    });
    return;
  }

  const metadata = {
    name: name,
    parents: parent ? [parent] : null,
    mimeType: 'application/vnd.google-apps.folder'
  };
  $.ajax({
    type: "POST",
    url: this.REST_FOLDER_CREATE,
    contentType: 'application/json',
    data: JSON.stringify(metadata),
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      callback && callback({
        message: null,
        data: data
      });
    },
    error: function(jqXHR, textStatus, errorTrown) {
      callback && callback({
        message: textStatus,
        errorTrown: errorTrown,
        jqXHR: jqXHR
      });
    }
  });
}

//delete folder
GDrive.prototype.deleteFolder = function(folderId, callback) {
  $.ajax({
    type: "DELETE",
    url: this.REST_FOLDER_DELETE + folderId,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      callback && callback({
        message: null,
        data: data
      });
    },
    error: function(jqXHR, textStatus, errorTrown) {
      callback && callback({
        message: textStatus,
        errorTrown: errorTrown,
        jqXHR: jqXHR
      });
    }
  });
}

//list
GDrive.prototype.list = function(parentId, callback, pageToken) {
  parentId = parentId ? parentId : 'root';
  const q = '\"' + parentId + '\"' + ' in parents';
  const parent = {
    corpora: "user",
    q: q,
    pageToken: pageToken,
    fields: "files(id, name, modifiedTime, description)"
  }
  $.ajax({
    type: "GET",
    url: this.REST_FOLDER_LIST,
    data: parent,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      callback && callback({
        message: null,
        data: data
      });
    },
    error: function(jqXHR, textStatus, errorTrown) {
      callback && callback({
        message: textStatus,
        errorTrown: errorTrown,
        jqXHR: jqXHR
      });
    }
  });
}

//create file fileMetadata
GDrive.prototype.createFileMetadata = function(meta, callback) {
  const metadata = {
    name: meta.name,
    parents: meta.parent ? meta.parent : null,
    description: meta.description
  }
  $.ajax({
    type: "POST",
    url: this.REST_FILE_CREATE_METADATA,
    contentType: 'application/json',
    data: JSON.stringify(metadata),
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      callback && callback({
        message: null,
        data: data
      });
    },
    error: function(jqXHR, textStatus, errorTrown) {
      callback && callback({
        message: textStatus,
        errorTrown: errorTrown,
        jqXHR: jqXHR
      });
    }
  });
}

//delete file
GDrive.prototype.deleteFile = function(fileId, callback) {
  $.ajax({
    type: "DELETE",
    url: this.REST_FILE_DELETE + fileId,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      callback && callback({
        message: null,
        data: data
      });
    },
    error: function(jqXHR, textStatus, errorTrown) {
      callback && callback({
        message: textStatus,
        errorTrown: errorTrown,
        jqXHR: jqXHR
      });
    }
  });
}

//create file fileMetadata
GDrive.prototype.createFileContent = function(fileId, data, callback) {
  $.ajax({
    type: "PATCH",
    url: this.REST_FILE_UPLOADCONTENT + fileId + this.REST_FILE_CONTENT_UPLOADMEDIA,
    data: data,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      callback && callback({
        message: null,
        data: data
      });
    },
    error: function(jqXHR, textStatus, errorTrown) {
      callback && callback({
        message: textStatus,
        errorTrown: errorTrown,
        jqXHR: jqXHR
      });
    }
  });
}

//create file fileMetadata
GDrive.prototype.getFileContent = function(file, callback) {
  const param = {
    alt: "media"
  }
  $.ajax({
    type: "GET",
    url: this.REST_FILE_GETCONTENT + file.fileId,
    data: param,
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    dataType: file.mine ? file.mine : "text",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      callback && callback({
        message: null,
        data: data
      });
    },
    error: function(jqXHR, textStatus, errorTrown) {
      callback && callback({
        message: textStatus,
        errorTrown: errorTrown,
        jqXHR: jqXHR
      });
    }
  });
}