var app = app || {};

app.ToolbarView = Backbone.View.extend({

  el: "#toolbar",

  template: toolbarTemplate,

  events: {
    'click #next': 'onnext',
    'click #up': 'onup',
    'click #clear': 'onclear',
  },

  initialize: function() {
    this.listenTo(this.model, "change:upStyle", this.render);
    this.listenTo(this.model, "change:nextStyle", this.render);
    this.listenTo(this.model, "change:curPage", this._pageChange);

    this.render();
  },

  onnext: function() {
    this.model.next();
  },

  onup: function() {
    this.model.up();
  },

  onclear: function() {
    this.trigger("toolbar-clear");
  },


  render: function() {
    var tmpl = _.template(this.template);
    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  },

  _pageChange() {
    this.trigger("toolbar-page-change", this.model);
  }

});