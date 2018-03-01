var app = app || {};

app.Note = Backbone.Model.extend({

  defaults: {
    id: 'no id',
    name: 'no name',
    modifiedTime: new Date(),
    description: "new note",
    text: "",
    on: false
  },

  select: function() {
    this.set("on", true);
  },

  unselect: function() {
    this.set("on", false);
  },

  editorChange: function(text) {
    this.set("text", text);
    this.set("description", text.substring(0, 30));
  },

  idAttribute: '_id'
});