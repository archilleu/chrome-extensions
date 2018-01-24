$(function() {
  function Files() {
    this.root = null;
    this.gdrive = chrome.extension.getBackgroundPage().gdrive;

    this.__defineGetter__("ROOT", function() {
      return "GNODE";
    })
  }

  Files.prototype.init = function(settings) {
    this._checkHasRoot({
      success: (result) => {
        if (result) {
          settings.success && settings.success();
          return;
        }

        this._createRoot({
          success: () => {
            settings.success && settings.success();
          },
          error: (status, msg) => {
            settings.error && settings.error(status, msg);
          },
          neterror: () => {
            settings.neterror && settings.neterror();
          }
        });
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror();
      }
    });
  }

  Files.prototype._checkHasRoot = function(settings) {
    this.gdrive.list({
      success: (data) => {
        for (const file of data.files) {
          if (this.ROOT == file.name) {
            this.root = file.id;
            settings.success && settings.success(true);
            return;
          }
        }
        settings.success && settings.success(false);
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror();
      }
    });
  }

  Files.prototype._createRoot = function(settings) {
    this.gdrive.createFolder({
      name: this.ROOT,
      parents: [],
      success: (data) => {
        this.root = data.id;
        settings.success && settings.success();
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror();
      }
    });
  };

  Files.prototype.listFolder = function(settings) {
    this.gdrive.list({
      parents: [this.root],
      success: (data) => {
        var files = data.files;
        var token = data.nextToken;
        var data = [];
        for (const file of files) {
          data.push({
            name: file.name,
            id: file.id
          });
        }

        while (token) {
          this.gdrive.list({
            success: (data) => {
              files = data.files;
              token = data.nextToken;
              for (const file of files) {
                data.push({
                  name: file.name,
                  id: file.id
                });
              }
            },
            error: () => {
              token = null;
            },
            neterror: () => {
              token = null;
            }
          });
        }
        settings.success && settings.success(files);
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror(status, msg);
      }
    });
  }

  Files.prototype.listFiles = function(folderId, callback) {
    this.gdrive.list(folderId, function(result) {
      if (null != result.message) {
        callback(result);
        return;
      }

      var files = result.data.files;
      var token = result.data.nextToken;
      var data = [];
      for (const file of files) {
        data.push({
          name: file.name,
          description: file.description,
          modifiedTime: file.modifiedTime,
          id: file.id
        });
      }

      while (token) {
        this.gdrive.list(folderId, function(result) {
          if (null != result.message) {
            callback({
              message: null,
              data: data
            });
            return;
          }

          files = result.data.files;
          token = result.data.nextToken;
          for (const file of files) {
            data.push({
              name: file.name,
              description: file.description,
              modifiedTime: file.modifiedTime,
              id: file.id
            });
          }
        }).bind(this);
      }

      callback({
        message: null,
        data: data
      })
    });
  }

  Files.prototype.createFolder = function(folderName, callback) {
    this.gdrive.createFolder(this.root, folderName, (result) => {
      if (null != result.message) {
        callback({
          message: result.message
        })
        return;
      }

      callback({
        message: null,
        data: {
          id: result.data.id
        }
      })
    });
  }

  Files.prototype.createFile = function(parent, callback) {
    this.gdrive.createFileMetadata({
      parent: parent,
      name: new Date().toCustomStr(),
      description: "新建便签"
    }, (result) => {
      if (null != result.message) {
        callback({
          message: result.message
        })
        return;
      }

      callback({
        message: null,
        data: {
          id: result.data.id,
          name: result.data.name,
          description: result.data.description,
          modifiedTime: result.data.modifiedTime || new Date()
        }
      })
    });
  }

  Files.prototype.getFileContent = function(fileId, callback) {
    this.gdrive.getFileContent({
      fileId: fileId,
      mine: "text"
    }, (result) => {
      if (null != result.message) {
        callback({
          message: result.message
        })
        return;
      }

      callback({
        message: null,
        data: result.data
      })
      return;
    });
  }

  Date.prototype.toCustomStr = function() {
    var yyyy = this.getFullYear();
    var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
    var dd = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
    var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
    var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
    var ss = this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds();
    return "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min).concat(ss);
  };

  window.files = new Files();
});