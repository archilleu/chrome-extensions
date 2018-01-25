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
GDrive.prototype.init = function(settings) {
  chrome.identity.getAuthToken({
    interactive: false
  }, function(token) {
    if (chrome.runtime.lastError) {
      settings.error && settings.error(chrome.runtime.lastError);
      return;
    }

    settings.success && settings.success();
  }.bind(this));
}

//auth
GDrive.prototype.checkAuth = function() {
  return (null == this.accessToken ? false : true);
}

//auth
GDrive.prototype.auth = function(settings) {
  chrome.identity.getAuthToken({
    interactive: true
  }, function(token) {
    if (chrome.runtime.lastError) {
      settings.error && settings.error(chrome.runtime.lastError);
      return;
    }

    this.accessToken = token;
    settings.success && settings.success();
  }.bind(this));
}

//remove cache auth
GDrive.prototype.removeCachedAuth = function(settings) {
  if (null == this.accessToken) {
    settings.success && settings.success();
    return;
  }

  const accessToken = this.accessToken;
  this.accessToken = null;

  chrome.identity.removeCachedAuthToken({
      token: accessToken
    },
    function() {
      settings.success && settings.success();
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
GDrive.prototype.createFolder = function(settings) {
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
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      settings.success && settings.success(data);
    },
    error: (jqXHR, textStatus, errorTrown) => {
      this.error(jqXHR, textStatus, errorTrown, settings);
    }
  });
}

//delete folder
GDrive.prototype.deleteFolder = function(settings) {
  $.ajax({
    type: "DELETE",
    url: this.REST_FOLDER_DELETE + settings.folderId,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      settings.success && settings.success(data);
    },
    error: (jqXHR, textStatus, errorTrown) => {
      this.error(jqXHR, textStatus, errorTrown, settings);
    }
  });
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
GDrive.prototype.list = function(settings) {

  let parents = settings.parents ? settings.parents : ["root"];
  let query = [];
  for (const parent of parents) {
    query.push('\"' + parent + '\"' + ' in parents');
  }
  const parameter = {
    corpora: settings.corpora ? settings.corpora : "user",
    q: query.join(" or "),
    pageToken: settings.pageToken ? settings.pageToken : null,
    fields: settings.fields ? settings.fields : "files(id, name, modifiedTime, description)"
  }
  $.ajax({
    type: "GET",
    url: this.REST_FOLDER_LIST,
    data: parameter,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      settings.success && settings.success(data);
    },
    error: (jqXHR, textStatus, errorTrown) => {
      this.error(jqXHR, textStatus, errorTrown, settings);
    }
  });
}

//create file fileMetadata
GDrive.prototype.createFileMetadata = function(settings) {
  const metadata = {
    name: settings.name,
    parents: settings.parents ? settings.parents : null,
    description: settings.description
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
      settings.success && settings.success(data);
    },
    error: (jqXHR, textStatus, errorTrown) => {
      this.error(jqXHR, textStatus, errorTrown, settings);
    }
  });
}

//delete file
GDrive.prototype.deleteFile = function(settings) {
  $.ajax({
    type: "DELETE",
    url: this.REST_FILE_DELETE + settings.fileId,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      settings.success && settings.success(data);
    },
    error: (jqXHR, textStatus, errorTrown) => {
      this.error(jqXHR, textStatus, errorTrown, settings);
    }
  });
}

//create file fileMetadata
GDrive.prototype.createFileContent = function(settings) {
  $.ajax({
    type: "PATCH",
    url: this.REST_FILE_UPLOADCONTENT + settings.fileId + this.REST_FILE_CONTENT_UPLOADMEDIA,
    data: settings.data,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      settings.success && settings.success(data);
    },
    error: (jqXHR, textStatus, errorTrown) => {
      this.error(jqXHR, textStatus, errorTrown, settings);
    }
  });
}

//create file fileMetadata
GDrive.prototype.getFileContent = function(settings) {
  const param = {
    alt: "media"
  }
  $.ajax({
    type: "GET",
    url: this.REST_FILE_GETCONTENT + settings.fileId,
    data: param,
    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
    dataType: settings.mine ? settings.mine : "text",
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data) {
      settings.success && settings.success(data);
    },
    error: (jqXHR, textStatus, errorTrown) => {
      this.error(jqXHR, textStatus, errorTrown, settings);
    }
  });
}

GDrive.prototype.error = function(jqXHR, textStatus, errorTrown, settings) {
  //net error
  if (0 == jqXHR.status) {
    settings.neterror && settings.neterror();
  } else {
    settings.error && settings.error(jqXHR.status, jqXHR.responseJSON);
  }
}