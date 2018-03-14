var app = app || {};

app.LinkView = Backbone.View.extend({
  tagName: 'div',
  className: 'item',
  template: linkTemplate,

  events: {
    'click': 'onclick'
  },

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
  },

  onclick: function() {
    this.trigger("item-click", this);
  },

  render: function() {
    var tmpl = _.template(this.template);
    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  },

});