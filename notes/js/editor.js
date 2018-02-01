class Editor {
  constructor(container) {
    this.changedCount = 0;
    this.onchange = null;

    $(container).append("<textarea id='codemirror-editor' style='display: none;'></textarea>");
    this.editor = CodeMirror.fromTextArea(document.getElementById("codemirror-editor"), {
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

    this.editor.on("changes", (ins, obj) => {
      this.changedCount += 1;

      if (!this.isChanged()) {
        return;
      }

      const abstract = this.editor.getRange({
        line: 0,
        ch: 0
      }, {
        line: 0,
        ch: 40
      });
      this.onchange && this.onchange(abstract);
    });

  }

  setValue(value) {
    this.editor.setValue(value);
    this.clearChange();
    this.editor.clearHistory();
  }

  getValue() {
    return this.editor.getValue();
  }

  clear() {
    this.editor.setValue("");
    this.clearChange();
    this.editor.clearHistory();
  }

  isChanged() {
    return this.changedCount > 1;
  }

  clearChange() {
    this.changedCount = 0;
  }
}