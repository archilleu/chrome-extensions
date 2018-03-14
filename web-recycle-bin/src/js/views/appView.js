var app = app || {};

app.AppView = Backbone.View.extend({
  el: $("body"),


  initialize: function(tabs) {
    this.tabs = tabs;

    this.closedTabs = this.tabs.getClosedTabs();
    this.toolbar = new app.ToolbarView({
      model: new app.Toolbar({
        tabsCount: this.closedTabs.length
      })
    });
    this.listenTo(this.toolbar, "toolbar-clear", this._clear);
    this.listenTo(this.toolbar, "toolbar-page-change", this._pageChange);

    this.links = new app.LinksView(this.tabs.getClosedTabs({
      start: 0,
      end: this.toolbar.model.get("pageSize")
    }));
    this.listenTo(this.links, "open-tab", this._openTab);
    this.listenTo(this.links, "remove-closed-tab", this._removeClosedTab);

  },

  _clear: function() {
    this.tabs.clear();
    window.close();
  },

  _pageChange: function(toolbar) {
    const pageSize = toolbar.get("pageSize");
    const curPage = toolbar.get("curPage");
    const begin = (curPage - 1) * pageSize;
    const end = curPage * pageSize;

    this.links.reset(this.tabs.getClosedTabs({
      start: begin,
      end: end
    }));

  },

  _openTab: function(model) {

    const option = {
      index: model.get("index"),
      url: model.get("href")
    }

    chrome.tabs.create(option);
  },

  _removeClosedTab: function(model) {
    this.tabs.removeClosedTab(model.get("id"));
  }

});