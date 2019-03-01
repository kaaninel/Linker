import PostCSS from "postcss";
import Nested from "postcss-nested";
import Extend from "postcss-extend";
import Clean from "postcss-csso";
import {
  Node,
  isTaggedTemplateExpression,
  TaggedTemplateExpression,
  isNoSubstitutionTemplateLiteral
} from "typescript";

export default class CSS {
  static Processor = PostCSS([Extend, Nested, Clean]);
  static Styles = {};
  static IsPostCSS(Node: Node) {
    return isTaggedTemplateExpression(Node) && Node.tag.getText() === "css";
  }

  static AddBlock(Node: TaggedTemplateExpression, Parent?: string) {
    try {
      if (isNoSubstitutionTemplateLiteral(Node.template)) {
        const Text = Node.template.text;
        this.Styles[Parent || Node.pos] =
          Parent ? `${Parent} { ${Text} }` : Text;
        return [];
      }
    } catch (Ex) {
      console.error("[PostCSS]", Ex.message, Ex.stack);
    }
  }
}
