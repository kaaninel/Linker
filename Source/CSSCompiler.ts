import PostCSS from "postcss";
import Nested from "postcss-nested";
import Clean from "postcss-csso";
import {
  Node,
  isTaggedTemplateExpression,
  TaggedTemplateExpression,
  isNoSubstitutionTemplateLiteral
} from "typescript";

export default class CSS {
  static Processor = PostCSS([Nested, Clean]);
  static Styles = {};
  static IsPostCSS(Node: Node) {
    return isTaggedTemplateExpression(Node) && Node.tag.getText() === "css";
  }

  static Process(Node: TaggedTemplateExpression, Parent?: string) {
    try {
      if (isNoSubstitutionTemplateLiteral(Node.template)) {
        const Text = Node.template.text;
        this.Styles[Parent || Node.pos] = this.Processor.process(
          Parent ? `${Parent} { ${Text} }` : Text,
          {
            from: undefined
          }
        );
        return [];
      }
    } catch (Ex) {
      console.error("[PostCSS]", Ex.message, Ex.stack);
    }
  }
}
