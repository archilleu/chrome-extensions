class Service {
  constructor() {
    this.root = null;
    this.gdrive = chrome.extension.getBackgroundPage().gdrive;
    this.__defineGetter__("ROOT", function() {
      return "GNODE";
    })
  }

  init(settings) {
    this._checkHasRoot({
      success: (result) => {
        settings.success && settings.success();
      },
      error: (status, msg) => {
        console.log("status:" + status, "msg:" + msg);
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
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror();
      }
    });
  }

  _checkHasRoot(settings) {
    this.gdrive.list({
      success: (data) => {
        for (const file of data.files) {
          if (this.ROOT == file.name) {
            this.root = file.id;
            settings.success && settings.success(true);
            return;
          }
        }

        settings.error && settings.error(404, msg);
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror();
      }
    });
  }

  _createRoot(settings) {
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

  uninit(settings) {
    this.gdrive.removeCachedAuth({
      success: () => {
        settings.success && settings.success();
      }
    });
  }

  list(settings) {
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

  createFolder(settings) {
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

  deleteFolder(settings) {
    this.gdrive.deleteFolder({
      folderId: settings.folderId,
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

  createFile(settings) {
    this.gdrive.createFileMetadata({
      parents: settings.parents,
      name: settings.modifiedTime,
      description: settings.name ? settings.name : "新建便签",
      success: (data) => {
        settings.success && settings.success(data);
        settings.final && settings.final();
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
        settings.final && settings.final();
      },
      neterror: () => {
        settings.neterror && settings.neterror();
        settings.final && settings.final();
      }
    });
  }

  deleteFile(settings) {
    this.gdrive.deleteFile({
      fileId: settings.fileId,
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

  getFileContent(settings) {
    this.gdrive.getFileContent({
      fileId: settings.fileId,
      mine: "text",
      success: (data) => {
        settings.success && settings.success(data);
        settings.final && settings.final();
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
        settings.final && settings.final();
      },
      neterror: () => {
        settings.neterror && settings.neterror();
        settings.final && settings.final();
      }
    });
  }

  saveFileContent(settings) {
    this.gdrive.createFileContent({
      fileId: settings.fileId,
      data: settings.data,
      success: (data) => {
        settings.success && settings.success(data);
        settings.final && settings.final();
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
        settings.final && settings.final();
      },
      neterror: () => {
        settings.neterror && settings.neterror();
        settings.final && settings.final();
      }
    });
  }
}