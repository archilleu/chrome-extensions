$(function() {

  const folderName = "test";
  const fileName = "test.txt";

  const gdrive = new GDrive();

  gdrive.auth(function(lastError) {
    if (null != lastError) {
      console.log("auth success" + lastError);
      return;
    }

    getTestFolder(function(result) {
      if (null == result) {
        console.error("create folder faild");
        return;
      }

      testFile(result);
    });
  });

  function getTestFolder(callback) {
    gdrive.list(null, function(result) {
      if (null != result.message) {
        console.log(result.message);
        callback(null);
        return;
      }

      for (let file of result.data.files) {
        if (folderName == file.name) {
          callback(file);
          return;
        }
      }

      gdrive.createFolder(null, folderName, function(result) {
        if (null != result.message) {
          console.log(result.message);
          callback(null);
          return;
        }

        callback(result.data);
      });
    });
  }


  function testFile(parentId) {

    gdrive.createFileMetadata(parentId.id, fileName, function(result) {
      if (null != result.message) {
        console.log(result.message);
        return;
      }

      gdrive.list(parentId.id, function(result) {
        if (null != result.message) {
          console.log(result.message);
          return;
        }

        let curFile = null;
        for (var file of result.data.files) {
          if (fileName == file.name) {
            curFile = file;
            break;
          }
        }

        if(null == curFile) {
          console.error("create file success");
        }

        const sendData = "abcdefg";
        gdrive.createFileContent(curFile.id, sendData, function(result) {
          if (null != result.message) {
            console.log(result.message);
            return;
          }

          gdrive.getFileContent({fileId:curFile.id}, function(result){
            if (null != result.message) {
              console.log(result.message);
              return;
            }

            if(sendData != result.data) {
              console.error("data error");
              return;
            }

            gdrive.deleteFile(curFile.id, function(){
              if(null != result.message) {
                console.log(result.message)
                return;
              }
            });
            gdrive.deleteFile(parentId.id, function(){
              if(null != result.message) {
                console.log(result.message)
                return;
              }
            });
          });
        });

      });
    });
  }

});
