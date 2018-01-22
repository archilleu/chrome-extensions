$(function() {
  const files = window.files;
  const noteFolders = window.noteFolderView;
  const noteFiles = window.noteFileView;
  const noteView = window.noteView;

  waitingDialog.show("loading...");
  files.init(function(result) {
    if (null != result.message) {
      waitingDialog.show(result.message);
      setTimeout(function() {
        waitingDialog.hide()
      }, 1000);
      return;
    }

    getNoteFolders(function() {
      waitingDialog.hide();
    });

    bindBtnClickEvent();

    noteFolders.addListener(cleanNoteListPrev);
    noteFolders.addListener(getNoteList);
  })

  function getNoteFolders(callback) {
    files.listFolder(null, result => {
      if (null != result.message) {
        callback({
          message: result.message
        });
        return;
      }

      for (folder of result.data) {
        folder.sum = 0;
        noteFolders.add(folder);
      }

      callback(null);
    })
  }

  function cleanNoteListPrev() {
    noteFiles.emptyList();
  }

  function getNoteList(folderId) {
    files.listFiles(folderId, result => {
      if (null != result.message) {
        callback({
          message: result.message
        })
        return;
      }

      for (file of result.data) {
        const $item = noteFiles.add(file);
        noteFiles.addListener(getNoteContent);
      }
    });
  }

  function getNoteContent(noteId) {
    files.getFileContent(noteId, function(result) {
      if(null != result.message) {
        return;
      }

      noteView.onNoteFileClick(result.data);
      return;
    })
  }


  function bindBtnClickEvent() {
    $("#create-folder-btn").click(onCreateFolder);
    $("#create-note-btn").click(onCreateNote);
    $(".btn-logout").click(() => {

    });
  }

  function onCreateFolder() {
    const name = $("#create-folder input").val();
    //Todo check repeat name

    files.createFolder(name, (result) => {
      waitingDialog.show("creating...");
      if (null != result.message) {
        waitingDialog.show(result.message)
        setTimeout(function() {
          waitingDialog.hide();
        }, 1000)
        return;
      }

      waitingDialog.hide();
      noteFolders.add({
        name: name,
        id: result.data.id,
        sum: 0
      })
    });

    $("#create-folder").modal("hide");
  }

  function onCreateNote() {
    const $currentFolder = noteFolders.getCurrentSelectFolder();
    if (0 == $currentFolder.length)
      return;

    const folderId = $currentFolder[0].dataset.id;
    files.createFile([folderId], (result) => {
      if (null != result.message) {
        return;
      }
    });
  }
})