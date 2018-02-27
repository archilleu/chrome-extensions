var app = app || {};

app.Folder = Backbone.Model.extend({

  defaults: {
    id: 'no id',
    name: 'no name',
    sum: 0,
    on: false,
    modifiedTime: new Date()
  },

  idAttribute: '_id',

  select: function() {
    this.set("on", true);
  },

  unselect: function() {
    this.set("on", false);
  },

});