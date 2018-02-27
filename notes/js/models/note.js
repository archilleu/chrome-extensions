var app = app || {};

app.Note = Backbone.Model.extend({
  defaults: {
    name: 'no name',
    time: new Date(),
    description: "new note",
    text: ""
  },

  idAttribute: '_id'
});