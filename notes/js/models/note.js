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

  setDescription: function(description) {
    this.set("description", description);
  },

  idAttribute: '_id'
});