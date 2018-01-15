$(function() {
  // $(".note-editor").click(function(){
  //   $(".codeMirror-code").append("<pre class='codeMirror-line'>ccccccccc</pre>");
  // });


  $(".codeMirror-line").click(function(event) {

      const xpos = adjustClickPosition(this, event.offsetX);
      const pos = calculateCursorPositionOnClick({
        offsetY: event.offsetY,
        top: this.offsetTop,
        height: this.clientHeight
      }, xpos);
      $(".codeMirror-cursor").css(pos);

      prepreaInput(this, xpos);

      $("#codeMirror-measure-text").focus();
      let left = parseInt($(".codeMirror-cursor").css("left"));
      $("#codeMirror-measure-text").keyup(function(){
        const inputText = $("#codeMirror-measure-text").val();
        readjustInputCursor(left, inputText);
        $(this).find(".edit-cursor").text(inputText);
      }.bind(this));

  })

  function adjustClickPosition(element, clickXPos) {
      const xPoss = calculateElementsubXPos(element);
      const val = shootTheElementPos(xPoss, clickXPos);
      return val;
  }

  function calculateCursorPositionOnClick(info, xpos) {
    const top = Math.floor((info.offsetY + info.top)/info.height) * info.height;
    return {
      top: top,
      left: xpos.val
    }
  }

  function calculateElementsubXPos(element) {
    $measure = $("#codeMirror-measure-length");
    const text = $(element).find(".edit-cursor").text();
    let subTextcursorPos = [];
    subTextcursorPos.push(0);
    for(let i=1; i<=text.length; i++) {
      const subText = text.substr(0, i);
      $measure.text(subText);
      subTextcursorPos .push($measure.width());
    }
    subTextcursorPos.push($measure.width()+1);

    return subTextcursorPos;
  }

  function shootTheElementPos(xPoss, xPos) {
    for(var i=0; i<xPoss.length; i++) {
      if((xPoss[i]+3) > xPos) {
        return {
          idx: i,
          val: xPoss[i]
        };
      }
    }

    return {
      idx:i-1,
      val: xPoss[i-1]
    };
  }

  function prepreaInput(element, xpos) {
    $this = $(element);
    $prefix = $($this.find(".edit-prefix"));
    $current = $($this.find(".edit-cursor"));
    $suffix = $($this.find(".edit-suffix"));
    const text = $current.text();
    $prefix.text(text.substr(0, xpos.idx));
    $current.text("");
    $suffix.text(text.substr(xpos.idx));
  }

  function readjustInputCursor(oldX, inputText) {
    $measure = $("#codeMirror-measure-length");
    $measure.text(inputText);
    $(".codeMirror-cursor").css("left", oldX+$measure.width());
  }
});
