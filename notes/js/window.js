$(function() {
  const files = window.files;
  const foldersView = new NoteFolderView(document.getElementsByClassName("folder-container")[0])
  const filesView = new NoteFilesView(document.getElementsByClassName("note-list")[0])
  const noteView = new NoteView(window.editor);

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

      foldersView.addListener("click", onNoteFolderClick);
      filesView.addListener("click", onNoteFileClick);
      filesView.addListener("contentReady", noteView.onContentReady);

      bindBtnClickEvent();
    },
    error: (status, msg) => {
      waitingDialog.show(status);
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
    files.list({
      success: (folder) => {
        for (folder of folder) {
          folder.sum = 0;
          foldersView.add(folder);
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

  function onNoteFolderClick(noteFolder) {
    files.list({
      parents: [noteFolder.dataset.id],
      success: (data) => {
        cleanNoteList();
        for (file of data) {
          const $item = filesView.add(file);
        }
      },
      error: (status, msg) => {

      },
      network: () => {

      }
    });
  }

  function onNoteFileClick(noteFile) {
    getNoteContent(noteFile.dataset.id);
  }

  function cleanNoteList() {
    filesView.empty();
  }

  function getNoteContent(noteId) {
    files.getFileContent({
      fileId: noteId,
      success: (data) => {
        filesView.notifyListeners("contentReady", data);
      },
      error: (status, msg) => {

      },
      neterror: () => {

      }
    });
  }

  function bindBtnClickEvent() {
    $("#create-folder-btn").click(onCreateFolder);
    $("#create-note-btn").click(onCreateNote);
    $(".btn-logout").click(() => {});
  }

  function onCreateFolder() {
    const name = $("#create-folder input").val();
    //Todo check repeat name

    waitingDialog.show("creating...");
    files.createFolder({
      name: name,
      success: (data) => {
        foldersView.add({
          name: name,
          id: data.id,
          sum: 0
        })
      },
      error: (status, msg) => {
        console.log(status + msg);
      },
      neterror: () => {
        console.log(status + msg);
      },
      final: () => {
        waitingDialog.hide();
        modalCreateFlderHide();
      }
    });
  }

  function onCreateNote() {
    const $currentFolder = foldersView.getCurrentSelectFolder();
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

function modalCreateFlderHide() {
  $("#create-folder").modal("hide");
}