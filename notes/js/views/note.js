var app = app || {};

app.NoteView = Backbone.View.extend({
  tagName: 'div',
  className: 'note-item',
  template: $('#noteTemplate').html(),

  events: {
    "click": "onclick",
  },

  initialize: function() {
    this.listenTo(this.model, 'change', this.render);
    this.listenTo(this.model, 'destroy', this.remove);
  },

  onclick: function() {
    this.model.select();
    this.model.trigger("item:on", this.model);
  },

  // setDescription: function(description) {
  //   this.model.set("description");
  // },
  //
  // getDescription: function() {
  //   return this.model.get("description");
  // },

  render: function() {
    //tmpl is a function that takes a JSON object and returns html
    var tmpl = _.template(this.template);

    //this.el is what we defined in tagName. use $el to get access to jQuery html() function
    this.$el.html(tmpl(this.model.toJSON()));

    return this;
  },

});