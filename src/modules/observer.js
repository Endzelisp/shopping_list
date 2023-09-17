export class Subject extends HTMLElement {
  constructor() {
    super();
    this.subcribers = [];
  }

  subscribe(observer) {
    this.subcribers.push(observer);
  }

  unSubscribe(ObsToBeDeleted) {
    this.subcribers = this.subcribers.filter((obs) => obs !== ObsToBeDeleted);
  }

  notify(obj) {
    this.subcribers.forEach((subcriber) => {
      subcriber.notify(obj);
    });
  }
}
