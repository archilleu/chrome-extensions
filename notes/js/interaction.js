class Loading {
  constructor(img) {
    const loading =
      '<div style="top: 0;bottom: 0;left: 0;right: 0;background-color: #9e9e9e33;position: fixed;z-index:100">' +
      '<img style="position: relative;top: 45%;left: 50%;" src="' + img + '" />' +
      '</div>';

    this.$loading = $(loading);
    $("body").append(this.$loading);
    this.$loading.hide();
  }

  show() {
    this.$loading.show();
  }

  hide() {
    this.$loading.hide();
  }
}

class Tips {
  constructor() {
    const tips = '<div id="snackbar"></div>';
    this.$tips = $(tips);
    $("body").append(this.$tips);
  }

  show(msg) {
    this.$tips.text(msg);
    this.$tips.addClass("show");
    setTimeout(() => {
      this.$tips.removeClass("show")
    }, 3000);
  }
}