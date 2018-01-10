$(function(){

    var gdrive = new GDrive();
    gdrive.auth(function(lastError){
      if(null != lastError) {
        console.log("auth success"+lastError);
        return;
      }

      gdrive.createFolder(null, "test", function(result){
        console.log(result);
      });
    //   gdrive.removeCachedAuth(function(){
    //     gdrive.auth(function(){
    //       gdrive.revokeAuth();
    //     })
    //   })
    })

    return;
});
