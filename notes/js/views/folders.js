var app = app || {};

app.FoldersView = Backbone.View.extend({
  el: $('#folder-container'),

  initialize: function(initialFolders) {
    this.collection = new app.Folders(initialFolders);
    this.render();

    this.listenTo(this.collection, "add", this.renderFolder);
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

  // render library by rendering each book in its collection
  render: function() {
    this.collection.each(function(item) {
      this.renderFolder(item);
    }, this);
  },

  // render a book by creating a BookView and appending the
  // element it renders to the library's element
  renderFolder: function(item) {
    var folderView = new app.FolderView({
      model: item
    });
    this.$el.append(folderView.render().el);
    this._bindItemOn(item);
  },

  _bindItemOn: function(item) {
    //不使用change:on消息而使用额外的消息是避免change:on循环触发
    this.collection.listenTo(item, "item:on", (obj) => {
      const selecteds = this.collection.selecteds();
      for (item of selecteds) {
        if (item == obj) {
          continue;
        }
        item.unselect();
      }
    })
  }

});