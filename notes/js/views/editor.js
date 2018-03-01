var app = app || {};

app.EditorView = Backbone.View.extend({

  initialize: function() {
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
      this.model.set("text", this.editor.getValue());
      this.trigger("change", this.model.get("text"));

      this.changedCount++;
    });

    this.changedCount = -1;
  },

  setText: function(text) {
    this.model.set("text", text);
    this.editor.setValue(text);
  },

  getText: function() {
    return this.model.get("text");
  },

  reset: function() {
    this.changedCount = -1;
  },

  isChanged: function() {
    return this.changedCount > 0;
  },

});