var app = app || {};

app.AppView = Backbone.View.extend({
  el: $("body"),

  events: {
    'click #btn-folder-create': 'showCreateFolderDlg',
    'click #btn-folder-create-ok': 'createFolder',
    'click #delete-folder-btn': 'deleteFolder',

    'click #btn-note-create': 'createNote',
    'click #btn-note-save': 'saveNote',
    'click #btn-note-delete': 'deleteNote',
  },

  initEvent: function() {
    this.EVENT_CREATE_ROOT = "event-create-root";
    this.EVENT_CHECK_HAS_FOLDER_ALL = "event-check-has-folder-all";
    this.EVENT_CREATE_FOLDER_ALL = "event-create-folder-all";
    this.EVENT_GET_FOLDERS = "event-get-folders";

    this.EVENT_ACTION_BEGIN = "event-action-begin";
    this.EVENT_ACTION_END = "event-action-end";

    this.EVENT_ERROR = "event-error";
    this.EVENT_NETERROR = "event-neterror";

    this.EVENT_FOLDER_LIST_READY = "event-folder-list-ready";
    this.EVENT_FOLDER_CLICK = "event-folder-click";
    this.EVENT_FOLDER_CREATE = "event-folder-create";
    this.EVENT_FOLDER_DELETE = "event-folder-delete";
    this.EVENT_FILE_CLICK = "event-file-click";
    this.EVENT_FILE_CREATE = "event-file-create";
    this.EVENT_FILE_DELETE = "event-file-delete";
    this.EVENT_FILE_LIST_READY = "event-file-list-ready";
    this.EVENT_FILE_DATA_READY = "event-file-data-ready";

    this.listenTo(this, this.EVENT_CREATE_ROOT, this.onCreateRoot);
    this.listenTo(this, this.EVENT_CREATE_FOLDER_ALL, this.onCreateFolderAll);
    this.listenTo(this, this.EVENT_CHECK_HAS_FOLDER_ALL, this.onCheckHasFolderAll);
    this.listenTo(this, this.EVENT_GET_FOLDERS, this.getNoteFolders)

    app.message.listenTo(this, this.EVENT_ACTION_BEGIN, app.message.show);
    app.message.listenTo(this, this.EVENT_ACTION_END, app.message.hide);

    app.message.listenTo(this, this.EVENT_ERROR, app.message.onerror);
    app.message.listenTo(this, this.EVENT_NETERROR, app.message.onneterror);

    this.listenTo(this, this.EVENT_FOLDER_LIST_READY, this.onFolderListReady);
    this.listenTo(this, this.EVENT_FILE_LIST_READY, this.onNoteListReady);
    this.listenTo(this, this.EVENT_FILE_DATA_READY, this.onNoteContentReady);

    this.notesView.listenTo(this.editorView, "change", this.onEditorChange.bind(this));
  },

  initialize: function() {
    this.foldersView = new app.FoldersView();
    this.listenTo(this.foldersView, "item:on", this.getNoteList);
    this.notesView = new app.NotesView();
    this.listenTo(this.notesView, "item:on", this.getNoteContent);
    this.editorView = new app.EditorView({
      model: new app.Editor()
    });

    this.initEvent();

    this.service = new Service();

    this.trigger(this.EVENT_ACTION_BEGIN);

    //检擦有没有根目录
    this.service.checkHasRoot({
      success: () => {
        //检擦有没有全部便签目录
        this.trigger(this.EVENT_CHECK_HAS_FOLDER_ALL);
      },
      error: (status, msg) => {
        if (404 == status) {
          this.trigger(this.EVENT_CREATE_ROOT);
          return;
        }

        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "checkHasRoot"
        })
      },

      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "checkHasRoot"
        })
      }
    });
  },

  onCreateRoot() {
    this.service.createRoot({
      success: () => {
        this.trigger(this.EVENT_CHECK_HAS_FOLDER_ALL);
      },
      error: (status, msg) => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "onCreateRoot"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "onCreateRoot"
        })
      }
    });
  },

  onCheckHasFolderAll() {
    this.service.checkHasFolderAll({
      success: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_GET_FOLDERS);
      },
      error: (status, msg) => {
        if (404 == status) {
          this.trigger(this.EVENT_CREATE_FOLDER_ALL);
          return;
        }

        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "onCheckHasFolderAll"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "onCheckHasFolderAll"
        })
      }
    })
  },

  getNoteFolders(settings) {
    this.trigger(this.EVENT_ACTION_BEGIN);
    this.service.list({
      orderBy: "modifiedTime",
      success: (folders) => {
        this.trigger(this.EVENT_FOLDER_LIST_READY, folders);
        this.trigger(this.EVENT_ACTION_END);
      },
      error: (status, msg) => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "getNoteFolders"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "getNoteFolders"
        })
      }
    });
  },

  getNoteList(folder) {
    this.trigger(this.EVENT_ACTION_BEGIN);
    this.service.list({
      orderBy: "modifiedTime desc",
      parents: [folder.get("id")],
      success: (notes) => {
        this.trigger(this.EVENT_FILE_LIST_READY, notes);
        this.trigger(this.EVENT_ACTION_END);
      },
      error: (status, msg) => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "getNoteList"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "getNoteList"
        })
      }
    });
  },

  getNoteContent: function(note) {
    this.trigger(this.EVENT_ACTION_BEGIN);
    this.service.getFileContent({
      fileId: note.get("id"),
      success: (data) => {
        this.trigger(this.EVENT_FILE_DATA_READY, data);
        this.trigger(this.EVENT_ACTION_END);
      },
      error: (status, msg) => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "getNoteContent"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "getNoteContent"
        })
      }
    });
  },

  onCreateFolderAll(settings) {
    this.service.onCreateFolderAll({
      success: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_GET_FOLDERS);
      },
      error: (status, msg) => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "onCreateFolderAll"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "onCreateFolderAll"
        })
      }
    });
  },

  onFolderListReady: function(folders) {
    this.foldersView.reset(folders);
  },

  onNoteListReady: function(notes) {
    this.notesView.reset(notes);
  },

  onNoteContentReady: function(text) {
    this.editorView.setText(text);
  },

  onEditorChange: function(text) {
    const selected = this.notesView.getSelected();
    if (!selected) {
      return;
    }

    selected.setDescription(text.substring(0, 15));
  },

  showCreateFolderDlg: function(e) {
    e.preventDefault();
    $("#create-folder").modal("show");
  },

  createFolder: function(e) {
    e.preventDefault();

    this.trigger(this.EVENT_ACTION_BEGIN);

    const name = $("#create-folder input").val();
    //Todo check repeat name

    this.service.createFolder({
      name: name,
      success: (data) => {
        this.trigger(this.EVENT_ACTION_END);
        this.foldersView.addFolder(data);
        $("#create-folder").modal("hide");
      },
      error: (status, msg) => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "createFolder"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "createFolder"
        })
      }
    });
  },

  deleteFolder: function(e) {
    e.preventDefault();

    const selected = this.foldersView.getSelected();
    if (!selected) {
      return;
    }

    if (!confirm("删除文件夹:" + selected.get("name"))) {
      return;
    }

    this.trigger(this.EVENT_ACTION_BEGIN);
    this.service.deleteFolder({
      folderId: selected.get("id"),
      success: () => {
        this.trigger(this.EVENT_FOLDER_DELETE, selected);
        this.trigger(this.EVENT_ACTION_END);
        this.foldersView.deleteFolder(selected);
      },
      error: (status, msg) => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "deleteFolder"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "deleteFolder"
        })
      }
    });
  },

  createNote: function() {
    const selected = this.foldersView.getSelected();
    if (!selected) {
      return;
    }

    this.trigger(this.EVENT_ACTION_BEGIN);

    this.service.createFile({
      parents: [selected.get("id")],
      name: "新建便签.txt",
      description: "新建便签",
      success: (data) => {
        // this.trigger(this.EVENT_FILE_CREATE, data);
        this.trigger(this.EVENT_ACTION_END);

        //触发自定义的点击事件，让appView更新notesView
        this.foldersView.trigger("item:on", selected);
      },
      error: (status, msg) => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "createNote"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "createNote"
        })
      }
    });
  },

  saveNote: function() {
    const selected = this.notesView.getSelected();
    if (!selected) {
      return;
    }
    const id = selected.get("id");
    const text = selected.getText();
    const description = selected.getDescription();
    this.service.saveFileContent({
      fileId: id,
      data: text,
      success: (data) => {
        this.service.updateFileMetadata({
          fileId: id,
          description: description,
          success: (data) => {
            this.trigger(this.EVENT_ACTION_END);
          },
          error: (status, msg) => {
            this.trigger(this.EVENT_ACTION_END);
            this.trigger(this.EVENT_ERROR, {
              status: status,
              msg: msg,
              method: "updateFileMetadata"
            })
          },
          neterror: () => {
            this.trigger(this.EVENT_ACTION_END);
            this.trigger(this.EVENT_NETERROR, {
              status: 0,
              method: "updateFileMetadata"
            })
          }
        }).bind(this);
      },
      error: (status, msg) => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "saveFileContent"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "saveFileContent"
        })
      }
    });
  },

  deleteNote: function() {
    const selected = this.notesView.getSelected();
    if (!selected) {
      return;
    }

    if (!confirm("删除笔记:" + selected.get("name"))) {
      return;
    }

    this.trigger(this.EVENT_ACTION_BEGIN);
    this.service.deleteFile({
      fileId: selected.get("id"),
      success: () => {
        // this.trigger(this.EVENT_FILE_CREATE, data);
        this.trigger(this.EVENT_ACTION_END);

        //触发自定义的点击事件，让appView更新notesView
        this.foldersView.trigger("item:on", this.foldersView.getSelected());
      },
      error: (status, msg) => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_ERROR, {
          status: status,
          msg: msg,
          method: "deleteNote"
        })
      },
      neterror: () => {
        this.trigger(this.EVENT_ACTION_END);
        this.trigger(this.EVENT_NETERROR, {
          status: 0,
          method: "deleteNote"
        })
      }
    });
  },

  render: function() {
    //tmpl is a function that takes a JSON object and returns html
    var tmpl = _.template(this.template);

    //this.el is what we defined in tagName. use $el to get access to jQuery html() function
    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  }
});