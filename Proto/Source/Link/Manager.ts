import LinkElement from "./Element";

type ManagerConstr = (Ctor: Function) => any;

declare global {
  const Execute: ManagerConstr & Record<string, ManagerConstr>;
}

export default class Manager extends LinkElement {
  static Instance: Manager;
  static DOM = true;

  static $Constr() {
    this.Instance = new this();
    if (this.DOM) document.documentElement.appendChild(this.Instance);
    else this.Instance.connectedCallback();
  }
}
