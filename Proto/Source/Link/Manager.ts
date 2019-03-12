import LinkElement from "./Element";
import { html } from "./Template";
import Attribute from "./Particles/Attribute";

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

export class Head extends Manager {
  Root = document.head;

  @Attribute.Prop Title = "Tencere";

  Template() {
    return html`
      <title>${this.Title}</title>
      <meta charset="UTF-8" />
      <meta
        name="viewport"
        content="width=device-width, 
          initial-scale=1.0, 
          user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"
      />

      <link rel="stylesheet" href="/Lib/Style.css" />
    `;
  }
}

export class Body extends Manager {
  Root = document.body;
}
