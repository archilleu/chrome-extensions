var app = app || {};

app.FoldersView = Backbone.View.extend({
  el: $('#folder-container'),

  initialize: function(initialFolders) {
    this.collection = new app.Folders(initialFolders);
    this.render();

    this.listenTo(this.collection, "add", this.renderFolder);
    this.listenTo(this.collection, "reset", this.render);
  },

  reset: function(folders) {
    let item = this.collection.pop();
    while (item) {
      item.destroy();
      item = this.collection.pop();
    }
    this.collection.reset(folders);
  },

  selectFirstItem: function() {
    if (this.collection.length) {
      const id = this.collection.models[0].get("id");
      $("#" + id).trigger("click");
    } else {
      this.trigger("editor:clear");
    }
  },

  addFolder: function(data) {
    this.collection.add(new app.Folder(data));
  },

  getSelected: function() {
    return this.collection.selected();
  },

  deleteFolder: function(selected) {
    selected.destroy(); //触发view的destroy事件，同时从colection中删除该模型
  },

  render: function() {
    this.collection.each(function(item) {
      this.renderFolder(item);
    }, this);
  },

  renderFolder: function(item) {
    var view = new app.FolderView({
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