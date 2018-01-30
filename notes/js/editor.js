$(function () {
  init();

  function init() {
    addEditorArea();
    initEditor();
  }

  function addEditorArea() {
    $(".note-editor").append("<textarea id='note-editor' style='display: none;'></textarea>");
  }

  function initEditor() {
    const editor = CodeMirror.fromTextArea(document.getElementById("note-editor"), {
      lineWrapping: true,
      tabSize: 4,
      scrollbarStyle: "simple",
      cursorHeight: 0.40,
      viewportMargin: Infinity,
      extraKeys: {
        // "Esc": function() {
        // }
      }
    })

    //监控内容是否改变
    editor.changedCount = 0;
    editor.__defineGetter__("changed", function () {
      return editor.changedCount > 1;
    });
    editor.on("changes", function (ins, obj) {
      editor.changedCount += 1;
    });

    window.editor = editor;
  }

});