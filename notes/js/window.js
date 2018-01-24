$(function() {
  const files = window.files;
  const noteFolders = window.noteFolderView;
  const noteFiles = window.noteFileView;
  const noteView = window.noteView;

  waitingDialog.show("loading...");
  files.init({
    success: () => {
      getNoteFolders({
        success: () => {
          waitingDialog.hide();
        },
        error: (status, msg) => {
          console.log("status: " + status + " msg: " + msg);
        },
        network: () => {
          console.log("network error");
        }
      });

      bindBtnClickEvent();

      noteFolders.addListener(cleanNoteListPrev);
      noteFolders.addListener(getNoteList);
    },
    error: (status, msg) => {
      waitingDialog.show(result.message);
      setTimeout(function() {
        waitingDialog.hide()
      }, 1000);
      console.log("status: " + status + " msg: " + msg);
    },
    neterror: () => {
      waitingDialog.show(result.message);
      setTimeout(function() {
        waitingDialog.hide()
      }, 1000);
      console.log("network error");
    }
  });

  function getNoteFolders(settings) {
    files.listFolder({
      success: (folder) => {
        for (folder of folder) {
          folder.sum = 0;
          noteFolders.add(folder);
        }
        settings.success && settings.success();
      },
      error: (status, msg) => {
        settings.error && settings.error(status, msg);
      },
      network: () => {
        settings.network && settings.network();
      }
    });
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
      if (null != result.message) {
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