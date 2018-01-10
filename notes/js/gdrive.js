/**
 * google drive class
 * reference:
 *            https://developer.chrome.com/apps/app_identity
*/

function GDrive() {
  this.accessToken = null;

  this.__defineGetter__("DEFAULT_CHUNK_SIZE", function() {
    return 1024 * 1024 * 5; // 5MB;
  });

  this.__defineGetter__("REST_FOLDER_CREATE", function() {
    return "https://www.googleapis.com/drive/v3/files";
  })

  this.__defineGetter__("REST_FILE_CREATE_METADATA", function() {
    return "https://www.googleapis.com/drive/v3/files";
  })

  this.__defineGetter__("REST_FILE_CONTENT", function() {
    return "https://www.googleapis.com/upload/drive/v3/files/" /*fileid +?uploadType=media or ...*/;
  })

  this.__defineGetter__("REST_FILE_CONTENT_UPLOADMEDIA", function() {
    return "?uploadType=media";
  })

}

//Authorization
GDrive.prototype.auth = function(callback) {
  try {
      chrome.identity.getAuthToken({interactive: true}, function(token) {
        if(chrome.runtime.lastError) {
          callback && callback(chrome.runtime.lastError.message);
          return;
        }

        if(token) {
          this.accessToken = token;
          callback && callback(null);
        }
    }.bind(this));
  } catch(e) {
    console.error(e);
  }
}

//remove cache auth
GDrive.prototype.removeCachedAuth = function(callback) {
  if(null == this.accessToken) {
    callback && callback();
    return;
  }

  const accessToken = this.accessToken;
  this.accessToken = null;

  chrome.identity.removeCachedAuthToken({token: accessToken},
    function() {
      callback && callback();
    }
  );
}

//revoke auth
GDrive.prototype.revokeAuth = function() {
    if(this.accessToken) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://accounts.google.com/o/oauth2/revoke?token=' + this.accessToken);
        xhr.send();
        this.removeCachedAuth();
    }
}

//create folder
GDrive.prototype.createFolder = function(parent, name, callback) {
  if(null == this.accessToken) {
    callback && callback({
        message:"token is null",
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
    success: function(data){
      callback && callback({
        message: null,
        data: data
      });
    }
  });
}

//create file fileMetadata
GDrive.prototype = createFileMetadata(parent, name, callback) {
  const metadata= {
    name: name,
    parents: parent ? [parent] : null
  }
  $.ajax({
    type: "POST",
    url: this.REST_FILE_CREATE_METADATA,
    contentType: 'application/json',
    data: JSON.stringify(metadata),
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data){
      callback && callback({
        message: null,
        data: data
      });
    }
  });
}

//create file fileMetadata
GDrive.prototype = createFileContent(fileId, data, callback) {
  $.ajax({
    type: "PATCH",
    url: this.REST_FILE_CONTENT + fileId + this.REST_FILE_CONTENT_UPLOADMEDIA,
    contentType: 'application/json',
    data: data,
    beforeSend: function(request) {
      request.setRequestHeader("Authorization", 'Bearer ' + this.accessToken);
    }.bind(this),
    success: function(data){
      callback && callback({
        message: null,
        data: data
      });
    }
  });
}
