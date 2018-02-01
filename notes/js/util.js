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

function dateToCustomStr(data) {
  var yyyy = data.getFullYear();
  var mm = data.getMonth() < 9 ? "0" + (data.getMonth() + 1) : (data.getMonth() + 1); // getMonth() is zero-based
  var dd = data.getDate() < 10 ? "0" + data.getDate() : data.getDate();
  var hh = data.getHours() < 10 ? "0" + data.getHours() : data.getHours();
  var min = data.getMinutes() < 10 ? "0" + data.getMinutes() : data.getMinutes();
  var ss = data.getSeconds() < 10 ? "0" + data.getSeconds() : data.getSeconds();
  return "".concat(yyyy).concat("-").concat(mm).concat("-").concat(dd).concat(" ").concat(hh).concat(":").concat(min).concat(":").concat(ss);
};