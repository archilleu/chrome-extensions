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

  Files.prototype.list = function(settings) {
    this.gdrive.list({
      parents: settings.parents ? settings.parents : [this.root],
      success: (data) => {
        var files = data.files;
        var token = data.nextToken;
        var data = [];
        for (const file of files) {
          data.push({
            id: file.id,
            name: file.name,
            description: file.description ? file.description : null,
            modifiedTime: file.modifiedTime ? file.modifiedTime : null,
          });
        }

        while (token) {
          this.gdrive.list({
            success: (data) => {
              files = data.files;
              token = data.nextToken;
              for (const file of files) {
                data.push({
                  id: file.id,
                  name: file.name,
                  description: file.description ? file.description : null,
                  modifiedTime: file.modifiedTime ? file.modifiedTime : null,
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

  Files.prototype.createFolder = function(settings) {
    this.gdrive.createFolder({
      parents: [this.root],
      name: settings.name,
      success: (data) => {
        settings.success && settings.success(data);
        settings.final && settings.final();
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
        settings.final && settings.final();
      },
      neterror: () => {
        settings.neterror && settings.neterror(status, msg);
        settings.final && settings.final();
      }
    });
  }

  Files.prototype.createFile = function(settings) {
    this.gdrive.createFileMetadata({
      parents: settings.parents,
      name: settings.modifiedTime,
      description: settings.name ? settings.name : "新建便签",
      success: (data) => {
        settings.success && settings.success(data);
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror();
      }
    });
  }

  Files.prototype.getFileContent = function(settings) {
    this.gdrive.getFileContent({
      fileId: settings.fileId,
      mine: "text",
      success: (data) => {
        settings.success && settings.success(data);
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror();
      }
    });
  }


  window.files = new Files();
});