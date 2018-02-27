class Service {
  constructor() {
    this.root = null;
    this.folderAll = null;
    this.gdrive = chrome.extension.getBackgroundPage().gdrive;
    this.__defineGetter__("ROOT", function() {
      return "GNODE";
    })
    this.__defineGetter__("FOLDER_ALL", function() {
      return "全部便签";
    })
  }

  checkHasRoot(settings) {
    this.list({
      parents: ["root"],
      success: (data) => {
        for (const file of data) {
          if (this.ROOT == file.name) {
            this.root = file.id;
            settings.success && settings.success(true);
            return;
          }
        }
        settings.error && settings.error(404, "not found");
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror();
      }
    });
  }

  createRoot(settings) {
    this.createFolder({
      name: this.ROOT,
      parents: ["root"],
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

  checkHasFolderAll(settings) {
    this.list({
      parents: [this.root],
      success: (data) => {
        for (const file of data) {
          if (this.FOLDER_ALL == file.name) {
            this.folderAll = file.id;
            settings.success && settings.success(true);
            return;
          }
        }
        settings.error && settings.error(404, "not found");
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror();
      }
    });
  }

  onCreateFolderAll(settings) {
    this.createFolder({
      name: this.FOLDER_ALL,
      parents: [this.root],
      success: (data) => {
        this.folderAll = data.id;
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
    // this.gdrive.revokeAuth();
    this.gdrive.removeCachedAuth({
      success: () => {
        settings.success && settings.success();
      }
    });
  }

  list(settings) {
    this.gdrive.list({
      parents: settings.parents ? settings.parents : [this.root],
      orderBy: settings.orderBy,
      success: (data) => {
        var files = data.files;
        var token = data.nextToken;
        var data = [];
        for (const file of files) {
          let modifiedTime = file.modifiedTime ? file.modifiedTime : null;
          modifiedTime = $.format.date(modifiedTime, "yyyy/MM/dd HH:mm:ss");
          data.push({
            id: file.id,
            name: file.name,
            description: file.description ? file.description : null,
            modifiedTime: modifiedTime
          });
        }

        while (token) {
          this.gdrive.list({
            parents: settings.parents ? settings.parents : [this.root],
            orderBy: settings.orderBy,
            success: (data) => {
              files = data.files;
              token = data.nextToken;
              for (const file of files) {
                let modifiedTime = file.modifiedTime ? file.modifiedTime : null;
                data.push({
                  id: file.id,
                  name: file.name,
                  description: file.description ? file.description : null,
                  modifiedTime: modifiedTime
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
        settings.success && settings.success(data);
      },
      e401: () => {
        this._reAuthSend(settings, this.list.bind(this));
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      neterror: () => {
        settings.neterror && settings.neterror();
      }
    });
  }

  createFolder(settings) {
    this.gdrive.createFolder({
      parents: settings.parents ? settings.parents : [this.root],
      name: settings.name,
      success: (data) => {
        settings.success && settings.success(data);
        settings.final && settings.final();
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
        settings.final && settings.final();
      },
      e401: () => {
        this._reAuthSend(settings, this.createFolder.bind(this));
      },
      neterror: () => {
        settings.neterror && settings.neterror();
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
      e401: () => {
        this._reAuthSend(settings, this.deleteFolder.bind(this));
      },
      neterror: () => {
        settings.neterror && settings.neterror();
        settings.final && settings.final();
      }
    });
  }

  createFile(settings) {
    this.gdrive.createFileMetadata({
      parents: settings.parents,
      name: settings.name,
      description: settings.description,
      success: (data) => {
        settings.success && settings.success(data);
        settings.final && settings.final();
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
        settings.final && settings.final();
      },
      e401: () => {
        this._reAuthSend(settings, this.createFile.bind(this));
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
      e401: () => {
        this._reAuthSend(settings, this.deleteFile.bind(this));
      },
      neterror: () => {
        settings.neterror && settings.neterror();
        settings.final && settings.final();
      }
    });
  }

  updateFileMetadata(settings) {
    this.gdrive.updateFileMetadata({
      fileId: settings.fileId,
      description: settings.description,
      success: (data) => {
        settings.success && settings.success(data);
        settings.final && settings.final();
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
        settings.final && settings.final();
      },
      e401: () => {
        this._reAuthSend(settings, this.createFile.bind(this));
      },
      neterror: () => {
        settings.neterror && settings.neterror();
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
      e401: () => {
        this._reAuthSend(settings, this.getFileContent.bind(this));
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
      e401: () => {
        this._reAuthSend(settings, this.saveFileContent.bind(this));
      },
      neterror: () => {
        settings.neterror && settings.neterror();
        settings.final && settings.final();
      }
    });
  }

  _reAuthSend(settings, fun) {
    this.gdrive.removeCachedAuth({
      success: () => {
        this.gdrive.init({
          success: () => {
            fun(settings);
          },
          error: () => {
            this.gdrive.auth({
              success: () => {
                fun(settings);
              },
              error: () => {
                settings.error && settings.error(403, "request auth failed");
              }
            })
          }
        });
      }
    });
  }

}