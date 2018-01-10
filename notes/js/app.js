$(function () {

  const folderName = "test";
  const fileName = "test.txt";
  let curFolder = null;
  let curFile = null;

  const gdrive = new GDrive();
  gdrive.auth(function (lastError) {
    if (null != lastError) {
      console.log("auth success" + lastError);
      return;
    }

    gdrive.createFolder(null, "test", function (result) {
      if (null != result.message) {
        console.log(result.message);
        return;
      }

      gdrive.list(null, function (result) {
        if (null != result.message) {
          console.log(result.message);
          return;
        }

        for (file in result.data.files) {
          if (folderName == file.name) {
            curFolder = file;
            break;
          }
        }

        if (null == curFolder) {
          console.error("create failed!");
          return;
        }

        gdrive.createFileMetadata(curFolder.id, "text.txt", function (result) {
          if (null != result.message) {
            console.log(result.message);
            return;
          }

          gdrive.list(curFolder.id, function (result) {
            if (null != result.message) {
              console.log(result.message);
              return;
            }

            for (file in result.data.files) {
              if (fileName == file.name) {
                curFile = file;
                break;
              }
            }

            gdrive.createFileContent(result.data.id, "abcd", function (result) {
              if (null != result.message) {
                console.log(result.message);
                return;
              }
            });

          });
        });
      });
    });
    //   gdrive.removeCachedAuth(function(){
    //     gdrive.auth(function(){
    //       gdrive.revokeAuth();
    //     })
    //   })
  })

  return;
});
