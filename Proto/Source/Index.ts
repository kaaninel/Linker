import Manager from "Link/Manager";
import { html, css } from "Link/Template";
import LinkElement from "Link/Element";

@CustomElement.UI
class HelloWorld extends LinkElement {
  Template() {
    return html`
      <h1>Hello World!</h1>
    `;
  }

  static Style = css`
    color: blue;
    &:hover {
      color: black;
    }
  `;
}

@Execute.body
class Body extends Manager {
  Root = document.body;

  Template() {
    return html`
      <ui-hello-world />
    `;
  }
}
