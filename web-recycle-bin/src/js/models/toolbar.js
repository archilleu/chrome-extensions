var app = app || {};

app.Toolbar = Backbone.Model.extend({

  defaults: {
    beginPage: 1,
    curPage: 0,
    tabsCount: 1,
    pageSize: 2,
    totalPage: 1,
    nextStyle: "none",
    upStyle: "none"
  },

  initialize: function() {
    this.set("totalPage", Math.ceil(this.get("tabsCount") / this.get("pageSize")));
    this._ajustStyle();
  },

  next: function() {
    const totalPage = this.get("totalPage");
    const curPage = this.get("curPage");
    if (curPage < totalPage) {
      this.set("curPage", curPage + 1);
      this._ajustStyle();
    }
  },

  up: function() {
    const totalPage = this.get("totalPage");
    const curPage = this.get("curPage");
    const beginPage = this.get("beginPage");
    if (curPage > beginPage) {
      this.set("curPage", curPage - 1);
      this._ajustStyle();
    }
  },

  _ajustStyle: function() {
    const totalPage = this.get("totalPage");
    const curPage = this.get("curPage");
    const beginPage = this.get("beginPage");

    if (curPage > beginPage) {
      this.set("upStyle", "inline");
    } else {
      this.set("upStyle", "none");
    }

    if (curPage < totalPage) {
      this.set("nextStyle", "inline");
    } else {
      this.set("nextStyle", "none");
    }

  }

});