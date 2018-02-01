class Controller extends Listener {
  constructor(foldersView, filesView, noteView, service) {
    super();

    this.foldersView = foldersView;
    this.filesView = filesView;
    this.noteView = noteView;
    this.service = service;

    this.$dlgCreateFolder = $("#create-folder");
    this.$dlgCreateNote = $("#create-note");

    this.EVENT_CREATE_ROOT = "event-create-root";
    this.EVENT_CHECK_HAS_FOLDER_ALL = "event-check-has-folder-all";
    this.EVENT_CREATE_FOLDER_ALL = "event-create-folder-all";
    this.EVENT_INIT_SUCCESS = "event-init-success";

    this.EVENT_ACTION_BEGIN = "event-action-begin";
    this.EVENT_ACTION_END = "event-action-end";

    this.EVENT_ERROR = "event-error";
    this.EVENT_NETERROR = "event-neterror";

    this.EVENT_REFRESH = "event-refresh";
    this.EVENT_FOLDER_LIST_READY = "event-folder-list-ready";
    this.EVENT_FOLDER_CLICK = "event-folder-click";
    this.EVENT_FOLDER_CREATE = "event-folder-create";
    this.EVENT_FOLDER_DELETE = "event-folder-delete";
    this.EVENT_FILE_CLICK = "event-file-click";
    this.EVENT_FILE_CREATE = "event-file-create";
    this.EVENT_FILE_DELETE = "event-file-delete";
    this.EVENT_FILE_LIST_READY = "event-file-list-ready";
    this.EVENT_FILE_DATA_READY = "event-file-data-ready";
  }

  init(settings) {
    this.notifyListeners(this.EVENT_ACTION_BEGIN);

    this.service.checkHasRoot({
      success: () => {
        this.notifyListeners(this.EVENT_CHECK_HAS_FOLDER_ALL, settings);
      },
      error: (status, msg) => {
        if (404 == status) {
          this.notifyListeners(this.EVENT_CREATE_ROOT, settings);
          return;
        }

        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "checkHasRoot"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "checkHasRoot"
        })
      }
    });
  }

  onCreateRoot(settings) {
    this.service.createRoot({
      success: () => {
        this.notifyListeners(this.EVENT_CHECK_HAS_FOLDER_ALL, settings);
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "onCreateRoot"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "onCreateRoot"
        })
      }
    });
  }

  onCheckHasFolderAll(settings) {
    this.service.checkHasFolderAll({
      success: () => {
        this._getNoteFolders({
          success: (folders) => {
            settings.success && settings.success();
            this.notifyListeners(this.EVENT_INIT_SUCCESS);
            this.notifyListeners(this.EVENT_FOLDER_LIST_READY, folders);
            this.notifyListeners(this.EVENT_ACTION_END);
          }
        });
      },
      error: (status, msg) => {
        if (404 == status) {
          this.notifyListeners(this.EVENT_CREATE_FOLDER_ALL, settings);
          return;
        }

        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "onCheckHasFolderAll"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "onCheckHasFolderAll"
        })
      }
    })
  }

  onCreateFolderAll(settings) {
    this.service.onCreateFolderAll({
      success: () => {
        this._getNoteFolders({
          success: (folders) => {
            this.notifyListeners(this.EVENT_INIT_SUCCESS);
            this.notifyListeners(this.EVENT_FOLDER_LIST_READY, folders);
            this.notifyListeners(this.EVENT_ACTION_END);
            settings.success && settings.success();
          }
        });
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "onCreateFolderAll"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "onCreateFolderAll"
        })
      }
    });
  }

  _getNoteFolders(settings) {
    this.service.list({
      orderBy: "modifiedTime",
      success: (folders) => {
        settings.success && settings.success(folders);
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "_getNoteFolders"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "_getNoteFolders"
        })
      }
    });
  }

  onFolderCreate(folder) {
    this.$dlgCreateFolder.modal('hide');
    this.folderClick(folder);
  }

  onFileCreate(file) {
    this.$dlgCreateNote.modal('hide');
    this.fileClick(file);
  }

  onFolderClick(folder) {
    //检擦内容是否有改变
    if (this.noteView.isChanged()) {
      //是否保存改变的内容
      if (!confirm("保存文件")) {
        this.noteView.clearChange();
        this.folderClick(folder);
        return;
      }

      //保存
      this._saveFile({
        success: () => {
          this.folderClick(folder);
        }
      });
    } else {
      this.folderClick(folder);
    }
  }

  onFileClick(file) {
    //检擦内容是否有改变
    if (this.noteView.isChanged()) {
      //是否保存改变的内容
      if (!confirm("保存文件")) {
        this.noteView.clearChange();
        this.fileClick(file);
        return;
      }

      //保存
      this._saveFile({
        success: () => {
          this.fileClick(file)
        }
      });
    } else {
      this.fileClick(file);
    }
  }

  folderClick(folder) {
    this.notifyListeners(this.EVENT_ACTION_BEGIN);

    const folderId = folder.dataset.id;
    this._onNoteFolderClick({
      folderId: folderId,
      success: (data) => {
        this.notifyListeners(this.EVENT_FILE_LIST_READY, data);
        this.notifyListeners(this.EVENT_ACTION_END);
        this.foldersView.highlight(folder);
      }
    });
  }

  _onNoteFolderClick(settings) {
    this.service.list({
      orderBy: "modifiedTime desc",
      parents: [settings.folderId],
      success: (data) => {
        settings.success && settings.success(data);
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "_onNoteFolderClick"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "_onNoteFolderClick"
        })
      }
    });
  }

  fileClick(file) {
    this.notifyListeners(this.EVENT_ACTION_BEGIN);

    const fileId = file.dataset.id;
    this._getNoteContent({
      fileId: fileId,
      success: (data) => {
        this.notifyListeners(this.EVENT_FILE_DATA_READY, data);
        this.notifyListeners(this.EVENT_ACTION_END);
        this.filesView.highlight(file);
      },
    });
  }

  _getNoteContent(settings) {
    this.service.getFileContent({
      fileId: settings.fileId,
      success: (data) => {
        settings.success && settings.success(data);
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "_getNoteContent"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "_getNoteContent"
        })
      }
    });
  }

  _createFolder() {
    this.notifyListeners(this.EVENT_ACTION_BEGIN);

    const name = $("#create-folder input").val();
    //Todo check repeat name

    this.service.createFolder({
      name: name,
      success: (data) => {
        data.sum = 0;
        this.notifyListeners(this.EVENT_FOLDER_CREATE, data);
        this.notifyListeners(this.EVENT_ACTION_END);
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "createFolder"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "createFolder"
        })
      }
    });
  }

  _deleteFolder() {
    const $currentFolder = this.foldersView.current();
    if (0 == $currentFolder.length)
      return;

    const id = $currentFolder[0].dataset.id;
    const name = $currentFolder.find(".folder-name").text();
    if (!confirm("删除文件夹", name)) {
      return;
    }

    this.notifyListeners(this.EVENT_ACTION_BEGIN);
    this.service.deleteFolder({
      folderId: id,
      success: () => {
        this.notifyListeners(this.EVENT_FOLDER_DELETE, $currentFolder);
        this.notifyListeners(this.EVENT_ACTION_END);
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "deleteFolder"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "deleteFolder"
        })
      }
    });
  }

  _refresh() {
    this.notifyListeners(this.EVENT_ACTION_BEGIN);

    this._getNoteFolders({
      success: (folders) => {
        this.notifyListeners(this.EVENT_REFRESH);
        this.notifyListeners(this.EVENT_FOLDER_LIST_READY, folders);
        this.notifyListeners(this.EVENT_ACTION_END);
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "_getNoteFolders"
        })
      },
      network: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "_getNoteFolders"
        })
      }
    });
  }

  _createNote() {
    this.notifyListeners(this.EVENT_ACTION_BEGIN);

    const $currentFolder = this.foldersView.current();
    if (0 == $currentFolder.length)
      return;

    const name = $("#create-note input").val();
    //Todo check repeat name

    const folderId = $currentFolder[0].dataset.id;
    const modifiedTime = dateToCustomStr(new Date());
    this.service.createFile({
      parents: [folderId],
      name: "新建便签.txt",
      description: "新建便签",
      success: (data) => {
        data.description = "新建便签";
        data.name = data.description + ".txt";
        data.modifiedTime = modifiedTime;
        data.id = data.id;
        this.notifyListeners(this.EVENT_FILE_CREATE, data);
        this.notifyListeners(this.EVENT_ACTION_END);
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "createFile"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "createFile"
        })
      }
    });
  }

  _saveFile(settings) {
    this.notifyListeners(this.EVENT_ACTION_BEGIN);

    const $curentFile = this.filesView.current();
    if (0 == $curentFile.length)
      return;

    const id = $curentFile[0].dataset.id;
    const data = this.noteView.getValue();
    this.service.saveFileContent({
      fileId: id,
      data: data,
      success: (data) => {
        this.noteView.clearChange();
        this.notifyListeners(this.EVENT_ACTION_END);
        settings.success && settings.success();
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "saveFileContent"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "saveFileContent"
        })
      }
    });
  }

  _deleteNote() {
    const $currentFile = this.filesView.current();
    if (0 == $currentFile.length)
      return;

    const id = $currentFile[0].dataset.id;
    const name = $currentFile.find("span")[0].textContent
    if (!confirm("删除文件", name)) {
      return;
    }

    this.notifyListeners(this.EVENT_ACTION_BEGIN);
    this.service.deleteFile({
      fileId: id,
      success: () => {
        this.notifyListeners(this.EVENT_FILE_DELETE, $currentFile);
        this.notifyListeners(this.EVENT_ACTION_END);
      },
      error: (status, msg) => {
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "deleteFile"
        })
      },
      neterror: () => {
        this.notifyListeners(this.EVENT_NETERROR, {
          status: 0,
          method: "deleteFile"
        })
      }
    });
  }

  _logout() {
    this.service.uninit({
      success: () => {
        this._gotoLogin();
      }
    });
  }

  _gotoLogin() {
    window.location.href = chrome.extension.getURL('login.html');
  }

  onBindBtnClickEvent() {
    $("#btn-folder-create-ok").click(this._createFolder.bind(this));
    $("#delete-folder-btn").click(this._deleteFolder.bind(this));
    $("#btn-refresh").click(this._refresh.bind(this));
    $("#btn-note-create").click(() => {
      //检擦内容是否有改变
      if (this.noteView.isChanged()) {
        //是否保存改变的内容
        if (!confirm("保存文件")) {
          this.noteView.clearChange();
          this.$dlgCreateNote.modal('show');
          return;
        }

        //保存
        this._saveFile({
          success: () => {
            this.$dlgCreateNote.modal('show');
          }
        });
      } else {
        this.$dlgCreateNote.modal('show');
      }
    });

    $("#btn-folder-create").click(() => {
      //检擦内容是否有改变
      if (this.noteView.isChanged()) {
        //是否保存改变的内容
        if (!confirm("保存文件")) {
          this.noteView.clearChange();
          this.$dlgCreateFolder.modal('show');
          return;
        }

        //保存
        this._saveFile({
          success: () => {
            this.$dlgCreateFolder.modal('show');
          }
        });
      } else {
        this.$dlgCreateFolder.modal('show');
      }
    });
    $("#btn-note-create-ok").click(this._createNote.bind(this));
    $(".btn-save").click(this._saveFile.bind(this));
    $(".btn-delete").click(this._deleteNote.bind(this));
    $("#btn-logout").click(this._logout.bind(this));
  }

}