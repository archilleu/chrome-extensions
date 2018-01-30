$(function() {
  const foldersView = new NoteFolderView(document.getElementsByClassName("folder-container")[0])
  const filesView = new NoteFilesView(document.getElementsByClassName("note-list")[0])
  const noteView = new NoteView();
  const controller = new Controller(foldersView, filesView, noteView, new Service());

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
  controller.addListener(controller.EVENT_CREATE_ROOT, controller.onCreateRoot.bind(controller));
  controller.addListener(controller.EVENT_CHECK_HAS_FOLDER_ALL, controller.onCheckHasFolderAll.bind(controller));
  controller.addListener(controller.EVENT_CREATE_FOLDER_ALL, controller.onCreateFolderAll.bind(controller));
  controller.addListener(controller.EVENT_INIT_SUCCESS, controller.onBindBtnClickEvent.bind(controller));

  controller.addListener(controller.EVENT_ERROR, (error) => {
    console.log(error);
  });
  controller.addListener(controller.EVENT_NETERROR, (error) => {
    console.log(error);
  });

  //init
  controller.init({
    success: () => {
      console.log("init success");
    },
    error: () => {
      console.log("init error");
    }
  });
});