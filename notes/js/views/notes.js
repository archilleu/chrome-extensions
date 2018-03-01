var app = app || {};

app.NotesView = Backbone.View.extend({
  el: $('#note-list'),

  initialize: function(initialNotes) {
    this.collection = new app.Notes(initialNotes);
    this.render();

    this.listenTo(this.collection, "add", this.renderNote);
    this.listenTo(this.collection, "reset", this.render);
  },

  reset: function(notes) {
    let item = this.collection.pop();
    while (item) {
      item.destroy();
      item = this.collection.pop();
    }
    this.collection.reset(notes);
  },

  selectFirstItem: function() {
    if (this.collection.length) {
      const id = this.collection.models[0].get("id");
      $("#" + id).trigger("click");
    }
  },

  addNote: function(data) {
    this.collection.add(new app.Note(data));
  },

  getSelected: function() {
    return this.collection.selected();
  },

  deleteFolder: function(selected) {
    selected.destroy(); //触发view的destroy事件，同时从colection中删除该模型
  },

  render: function() {
    this.collection.each(function(item) {
      this.renderNote(item);
    }, this);
  },

  renderNote: function(item) {
    var view = new app.NoteView({
      model: item
    });
    this.$el.append(view.render().el);

    this.listenTo(view, "item:on", (item) => {
      this.trigger("item:on", item);
    });
  },

  selectedChange: function(cur_item) {
    const selecteds = this.collection.selecteds();
    for (item of selecteds) {
      if (item == cur_item) {
        continue;
      }
      item.unselect();
    }

    cur_item.select();
  },

});