var app = app || {};

app.Notes = Backbone.Collection.extend({

  model: app.Note,

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