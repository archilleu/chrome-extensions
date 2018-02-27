var app = app || {};

app.MessageView = Backbone.View.extend({
  events: {
    "error": "onerror",
    "neterror": "onneterror"
  },

  initialize: function() {
    const loading =
      '<div style="top: 0;bottom: 0;left: 0;right: 0;background-color: #9e9e9e33;position: fixed;z-index:100">' +
      '<img style="position: relative;top: 45%;left: 50%;" src="' + "images/loading.gif" + '" />' +
      '</div>';

    this.$loading = $(loading);
    $("body").append(this.$loading);
    this.$loading.hide();

    const tips = '<div id="snackbar"></div>';
    this.$tips = $(tips);
    $("body").append(this.$tips);
  },

  show: function() {
    this.$loading.show();
  },

  hide: function() {
    this.$loading.hide();
  },

  tip: function(msg) {
    this.$tips.text(msg);
    this.$tips.addClass("show");
    setTimeout(() => {
      this.$tips.removeClass("show")
    }, 3000);
  },

  onerror: function(error) {
    this.tip(error.msg.error.message);
    console.log(error);
  },

  onneterror: function(error) {
    this.tip("网络不通");
    console.log(msg);
  },
});
app.message = new app.MessageView();