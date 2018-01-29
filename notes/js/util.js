Date.prototype.toCustomStr = function() {
  var yyyy = this.getFullYear();
  var mm = this.getMonth() < 9 ? "0" + (this.getMonth() + 1) : (this.getMonth() + 1); // getMonth() is zero-based
  var dd = this.getDate() < 10 ? "0" + this.getDate() : this.getDate();
  var hh = this.getHours() < 10 ? "0" + this.getHours() : this.getHours();
  var min = this.getMinutes() < 10 ? "0" + this.getMinutes() : this.getMinutes();
  var ss = this.getSeconds() < 10 ? "0" + this.getSeconds() : this.getSeconds();
  return "".concat(yyyy).concat(mm).concat(dd).concat(hh).concat(min).concat(ss);
};

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