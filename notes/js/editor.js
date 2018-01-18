$(function() {
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
    });

    window.editor = editor;
  }

});