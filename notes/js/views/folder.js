var app = app || {};

app.FolderView = Backbone.View.extend({
  tagName: 'div',
  className: 'folder-item',
  template: $('#folderTemplate').html(),

  events: {
    "click": "onclick",
  },

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
  },

  onclick: function() {
    //转发点击消息，自是为了得到完整的folder项
    this.trigger("item:on", this.model);
  },

  render: function() {
    //tmpl is a function that takes a JSON object and returns html
    var tmpl = _.template(this.template);

    //this.el is what we defined in tagName. use $el to get access to jQuery html() function
    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  },

});