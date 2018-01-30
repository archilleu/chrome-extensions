Date.prototype.toCustomStr = function() {
  var yyyy = this.getFullYear();
  var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
  var dd = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
  var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
  var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
  var ss = this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds();
  return "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min).concat(ss);
};

class Loading {
  constructor(gif) {
    const loading =
      '<div style="top: 0;bottom: 0;left: 0;right: 0;background-color: #9e9e9e33;position: fixed;z-index:100">' +
      '<img style="position: relative;top: 45%;left: 50%;" src="' + gif + '" />' +
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
    this.$tips = $("#snackbar");
  }

  show(msg) {
    this.$tips.text(msg);
    this.$tips.addClass("show");
    setTimeout(() => {
      this.$tips.removeClass("show")
    }, 3000);
  }
}

class HtmlTemplate {
  constructor(html) {
    this.html = html;
  }

  format(args) {
    if (arguments.length < 1) {
      return this.html;
    }

    var data = arguments;
    if (arguments.length == 1 && typeof(args) == "object") {
      data = args;
    }
    for (var key in data) {
      var value = data[key];
      if (undefined != value) {
        this.html = this._replaceAll("\\{" + key + "\\}", value);
      }
    }

    return this.html;
  }

  _replaceAll(exp, str) {
    return this.html.replace(new RegExp(exp, "gm"), str);
  }
}

class Listener {
  constructor() {
    this.listeners = {};
  }

  addListener(type, listener) {
    if (!this.listeners[type]) {
      this.listeners[type] = [];
    }
    let listeners = this.listeners[type];
    listeners.push(listener);
  }

  notifyListeners(type, param) {
    if (type) {
      const list = this.listeners[type];
      if (list) {
        for (const listener of list)
          listener(param);
      }
      return;
    }

    for (list of this.listeners) {
      for (const listener of list)
        listener(param);
    }
  }
}