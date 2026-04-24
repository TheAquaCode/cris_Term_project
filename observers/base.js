// Observer Pattern Implementation

// Subject (Observable) base class
class Subject {
  constructor() {
    this._observers = [];
  }

  subscribe(observer) {
    if (!this._observers.includes(observer)) {
      this._observers.push(observer);
    }
  }

  unsubscribe(observer) {
    this._observers = this._observers.filter(obs => obs !== observer);
  }

  notify(event, data) {
    this._observers.forEach(observer => {
      if (typeof observer.update === 'function') {
        observer.update(event, data);
      }
    });
  }
}

// Observer base class
class Observer {
  update(event, data) {
    throw new Error('Observer.update() must be implemented');
  }
}

module.exports = { Subject, Observer };
