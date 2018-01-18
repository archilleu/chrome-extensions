$(function() {
  function Files() {
    this.root = null;
    this.gdrive = chrome.extension.getBackgroundPage().gdrive;

    this.__defineGetter__("ROOT", function() {
      return "GNODE";
    })
  }

  Files.prototype.init = function(callback) {

    this._checkHasRoot((result) => {
      if (null == result) {
        callback({
          message: "init failed, try agin",
          data: null
        })
        return;
      }

      if (result) {
        callback({
          message: null,
          data: null
        })
        return;
      }

      this._createRoot((result) => {
        callback(result)
      });

    })

  }

  Files.prototype._checkHasRoot = function(callback) {
    this.gdrive.list(null, (result) => {
      if (null != result.message) {
        callback(null);
        return;
      }
      for (const file of result.data.files) {
        if (this.ROOT == file.name) {
          this.root = file.id;
          callback(true);
          return;
        }
      }

      callback(false);
    });
  }

  Files.prototype._createRoot = function(callback) {
    this.gdrive.createFolder(null, this.ROOT, function(result) {
      if (null != result.message) {
        callback({
          message: result.message,
          data: null
        });

        return;
      }

      this.root = result.data.id;
      callback({
        message: null,
        data: null
      });
      return;
    })
  };

  Files.prototype.listFolder = function(folderId, callback) {
    if (null == folderId) folderId = this.root;
    this.gdrive.list(folderId, function(result) {
      if (null != result.message) {
        callback(result);
        return;
      }

      var files = result.data.files;
      var token = result.data.nextToken;
      var data = [];
      for (const file of files) {
        data.push({
          name: file.name,
          id: file.id
        });
      }

      while (token) {
        this.gdrive.list(folderId, function(result) {
          if (null != result.message) {
            callback({
              message: null,
              data: data
            });
            return;
          }

          files = result.data.files;
          token = result.data.nextToken;
          for (const file of files) {
            data.push({
              name: file.name,
              id: file.id
            });
          }
        }).bind(this);
      }

      callback({
        message: null,
        data: data
      })
    });
  }

  Files.prototype.listFiles = function(folderId, callback) {
    this.gdrive.list(folderId, function(result) {
      if (null != result.message) {
        callback(result);
        return;
      }

      var files = result.data.files;
      var token = result.data.nextToken;
      var data = [];
      for (const file of files) {
        data.push({
          name: file.name,
          description: file.description,
          modifiedTime: file.modifiedTime,
          id: file.id
        });
      }

      while (token) {
        this.gdrive.list(folderId, function(result) {
          if (null != result.message) {
            callback({
              message: null,
              data: data
            });
            return;
          }

          files = result.data.files;
          token = result.data.nextToken;
          for (const file of files) {
            data.push({
              name: file.name,
              description: file.description,
              modifiedTime: file.modifiedTime,
              id: file.id
            });
          }
        }).bind(this);
      }

      callback({
        message: null,
        data: data
      })
    });

  }

  window.files = new Files();
});