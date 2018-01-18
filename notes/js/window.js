$(function() {
  const files = window.files;
  const noteFolders = window.noteFolderView;
  const noteFiles = window.noteFileView;

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

  function getNoteList(folderId) {
    files.listFiles(folderId, result => {
      if (null != result.message) {
        callback({
          message: result.message
        })
        return;
      }

      for (file of result.data) {
        noteFiles.add(file);
      }
    });
  }


  function bindBtnClickEvent() {

  }
})