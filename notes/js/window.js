Date.prototype.toCustomStr = function () {
  var yyyy = this.getFullYear();
  var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
  var dd = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
  var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
  var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
  var ss = this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds();
  return "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min).concat(ss);
};
class Controller {
  constructor(foldersView, filesView, noteView, files) {
    this.foldersView = foldersView;
    this.filesView = filesView;
    this.noteView = noteView;
    this.files = files;
    this.listeners = {};

    this.EVENT_INIT_SUCCESS = "event-init-success";
    this.EVENT_FOLDER_LIST_READY = "event-folder-list-ready";
    this.EVENT_FOLDER_CLICK = "event-folder-click";
    this.EVENT_FOLDER_CREATE = "event-folder-create";
    this.EVENT_FOLDER_DELETE = "event-folder-delete";
    this.EVENT_FILE_CLICK = "event-file-click";
    this.EVENT_FILE_CREATE = "event-file-create";
    this.EVENT_FILE_DELETE = "event-file-delete";
    this.EVENT_FILE_LIST_READY = "event-file-list-ready";
    this.EVENT_FILE_DATA_READY = "event-file-data-ready";

    this.EVENT_REFRESH = "event-refresh";
    this.EVENT_ERROR = "event-error";
  }

  addListener(type, listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    let listeners = this.listeners[type];
    listeners.push(listener);
  }

  notifyListeners(type, target) {
    if (type) {
      const list = this.listeners[type];
      if (list) {
        for (const listener of list)
          listener(target);
      }
      return;
    }

    for (list of this.listeners) {
      for (const listener of list)
        listener(target);
    }
  }

  init() {
    this.files.init({
      success: () => {
        this._getNoteFolders({
          success: (folders) => {
            this.notifyListeners(this.EVENT_FOLDER_LIST_READY, folders);
            this.notifyListeners(this.EVENT_INIT_SUCCESS);
          },
          error: (status, msg) => {
            console.log("status: " + status + " msg: " + msg);
            this.notifyListeners(this.EVENT_ERROR, {
              status: status,
              msg: msg
            })
          },
          network: () => {
            console.log("network error");
            this.notifyListeners(this.EVENT_ERROR, {
              status: 0
            })
          }
        });
      },
      error: (status, msg) => {
        console.log("status: " + status + " msg: " + msg);
        this.notifyListeners(this.EVENT_ERROR, {
          status: status,
          msg: msg
        })
      },
      neterror: () => {
        console.log("network error");
        this.notifyListeners(this.EVENT_ERROR, {
          status: 0
        })
      }
    });
  }

  _getNoteFolders(settings) {
    this.files.list({
      success: (folders) => {
        settings.success && settings.success(folders);
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      network: () => {
        settings.network && settings.network();
      }
    });
  }

  onFolderClick(folder) {
    const folderId = folder.dataset.id;
    this._onNoteFolderClick(folderId);
  }

  _onNoteFolderClick(folderId) {
    files.list({
      parents: [folderId],
      success: (data) => {
        this.notifyListeners(this.EVENT_FILE_LIST_READY, data);
      },
      error: (status, msg) => { },
      network: () => { }
    });
  }

  onFileClick(file) {
    const fileId = file.dataset.id;
    this._getNoteContent(fileId);
  }

  _getNoteContent(noteId) {
    files.getFileContent({
      fileId: noteId,
      success: (data) => {
        this.notifyListeners(this.EVENT_FILE_DATA_READY, data);
      },
      error: (status, msg) => { },
      neterror: () => { }
    });
  }

  onBindBtnClickEvent() {
    $("#create-folder-btn").click(() => {
      const name = $("#create-folder input").val();
      //Todo check repeat name

      this.files.createFolder({
        name: name,
        success: (data) => {
          data.sum = 0;
          this.notifyListeners(this.EVENT_FOLDER_CREATE, data);
        },
        error: (status, msg) => { },
        neterror: () => { },
        final: () => { }
      });
    });

    $("#delete-folder-btn").click(() => {
      const $currentFolder = this.foldersView.current();
      if (0 == $currentFolder.length)
        return;

      const id = $currentFolder[0].dataset.id;
      const name = $currentFolder.find(".folder-name").text();
      if (!confirm("删除文件夹", name)) {
        return;
      }

      this.files.deleteFolder({
        folderId: id,
        success: () => {
          this.notifyListeners(this.EVENT_FOLDER_DELETE, $currentFolder);
        },
        error: (status, msg) => { },
        neterror: () => { },
        final: () => { }
      });
    });

    $("#btn-refresh").click(() => {
      this._getNoteFolders({
        success: (folders) => {
          this.notifyListeners(this.EVENT_REFRESH);
          this.notifyListeners(this.EVENT_FOLDER_LIST_READY, folders);
        },
        error: (status, msg) => {
          console.log("status: " + status + " msg: " + msg);
          this.notifyListeners(this.EVENT_ERROR, {
            status: status,
            msg: msg
          })
        },
        network: () => {
          console.log("network error");
          this.notifyListeners(this.EVENT_ERROR, {
            status: 0
          })
        }
      });
    });

    $("#create-note-btn").click(() => {
      const $currentFolder = this.foldersView.current();
      if (0 == $currentFolder.length)
        return;

      const name = $("#create-note input").val();
      //Todo check repeat name

      const folderId = $currentFolder[0].dataset.id;
      const modifiedTime = new Date().toCustomStr();
      this.files.createFile({
        parents: [folderId],
        name: name,
        modifiedTime: modifiedTime,
        success: (data) => {
          data.description = name;
          data.modifiedTime = modifiedTime;
          data.id = data.id;
          this.notifyListeners(this.EVENT_FILE_CREATE, data);
        },
        error: (status, msg) => { },
        neterror: () => { }
      });
    });

    $(".btn-save").click(() => {
      const $curentFile = this.filesView.current();
      if (0 == $curentFile.length)
        return;

      const id = $curentFile[0].dataset.id;
      const data = this.noteView.getValue();
      this.files.saveFileContent({
        fileId: id,
        data: data,
        success: (data) => {
          console.log(data);
        },
        error: (status, msg) => {
        },
        neterror: () => { }
      });
    });

    $(".btn-delete").click(() => {
      const $currentFile = this.filesView.current();
      if (0 == $currentFile.length)
        return;

      const id = $currentFile[0].dataset.id;
      const name = $currentFile.find("span")[0].textContent
      if (!confirm("删除文件", name)) {
        return;
      }

      this.files.deleteFile({
        fileId: id,
        success: () => {
          this.notifyListeners(this.EVENT_FILE_DELETE, $currentFile);
          console.log("delete file:" + name);
        },
        error: (stauts, msg) => { },
        neterror: () => { }
      });
    });

    $("#btn-logout").click(()=>{
      this.files.uninit({
        success: ()=> {
          this.gotoLogin();
        }
      });
    });
  }

  on401Reauth() {
  }

  gotoLogin() {
    window.open(chrome.extension.getURL('login.html'));
  }
}

$(function () {
  const foldersView = new NoteFolderView(document.getElementsByClassName("folder-container")[0])
  const filesView = new NoteFilesView(document.getElementsByClassName("note-list")[0])
  const noteView = new NoteView();
  const controller = new Controller(foldersView, filesView, noteView, window.files);

  //controllder 关注的事件
  foldersView.addListener(foldersView.EVENT_CLICK, controller.onFolderClick.bind(controller));
  filesView.addListener(filesView.EVENT_CLICK, controller.onFileClick.bind(controller));

  //foldersView 关注的事件
  controller.addListener(controller.EVENT_FOLDER_CREATE, foldersView.add.bind(foldersView));
  controller.addListener(controller.EVENT_REFRESH, foldersView.onEmpty.bind(foldersView));
  controller.addListener(controller.EVENT_FOLDER_LIST_READY, foldersView.onListDataReady.bind(foldersView));
  controller.addListener(controller.EVENT_FOLDER_DELETE, foldersView.del.bind(foldersView));

  //filesView 关注的事件
  controller.addListener(controller.EVENT_FILE_LIST_READY, filesView.onEmpty.bind(filesView));
  controller.addListener(controller.EVENT_FILE_LIST_READY, filesView.onListDataReady.bind(filesView));
  controller.addListener(controller.EVENT_FILE_CREATE, filesView.add.bind(filesView));
  controller.addListener(controller.EVENT_FILE_DELETE, filesView.del.bind(filesView))
  controller.addListener(controller.EVENT_REFRESH, filesView.onEmpty.bind(filesView));

  //noteView 关注的事件
  controller.addListener(controller.EVENT_FILE_DATA_READY, noteView.onDataReady.bind(noteView));
  foldersView.addListener(foldersView.EVENT_CLICK, noteView.onClear.bind(noteView));
  controller.addListener(controller.EVENT_REFRESH, noteView.onClear.bind(noteView));
  controller.addListener(controller.EVENT_FILE_DELETE, noteView.onClear.bind(noteView));

  //其他事件
  controller.addListener(controller.EVENT_INIT_SUCCESS, controller.onBindBtnClickEvent.bind(controller));
  controller.addListener(controller.EVENT_ERROR, function () { });

  //init
  controller.init();
});