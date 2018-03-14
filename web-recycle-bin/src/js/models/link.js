var app = app || {};

app.Link = Backbone.Model.extend({

  defaults: {
    id: 0,
    index: 0,
    image: 'images/default.png',
    href: 'http://www.google.com',
    title: "google",
    content: "google",
    date: new Date(),
    time: "00:00"
  },

  initialize: function() {
    const date = this.get("date");
    let hour = date.getHours();
    let min = date.getMinutes();
    hour = hour < 9 ? ("0" + hour) : hour;
    min = min < 9 ? ("0" + min) : min;

    this.set("time", hour + ":" + min);
  },

});