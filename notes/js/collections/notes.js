var app = app || {};

app.Notes = Backbone.Collection.extend({
  model: app.Notes,
  url: '/api/books'
});