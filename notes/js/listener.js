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