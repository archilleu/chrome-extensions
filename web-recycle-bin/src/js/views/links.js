var app = app || {};

app.LinksView = Backbone.View.extend({
  el: $('#item-list'),

  initialize: function(links) {
    this.collection = new app.Links(links);
    this.listenTo(this.collection, "reset", this.render);

    this.render();
  },

  render: function() {
    this.$el.empty();
    this.collection.each(function(item) {
      this.renderNote(item);
    }, this);
  },

  openTab: function(model, collection, options) {
    console.log(model);
  },

  reset: function(links) {
    this.collection.reset(links)
  },

  renderNote: function(item) {
    var view = new app.LinkView({
      model: item
    });
    this.$el.append(view.render().el);

    this.listenTo(view, "item-click", () => {
      this.collection.remove(view.model);
      view.remove();

      this.trigger("remove-closed-tab", view.model);
      this.trigger("open-tab", view.model);
    });
  },

});