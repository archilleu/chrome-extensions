var app = app || {};

app.Folders = Backbone.Collection.extend({

  model: app.Folder,

  selected: function() {
    return this.find(function(item) {
      return (true == item.get("on"));
    });
  },

  selecteds: function() {
    return this.where({
      on: true
    });
  }

});