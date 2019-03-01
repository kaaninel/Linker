import * as ts from "typescript";
import PostCSS from "../CSSCompiler";

type SClass = ts.ClassDeclaration & { Tag?: string };

function ElementDefine(Tag: string, Classname: string) {
  return ts.createStatement(
    ts.createCall(
      ts.createPropertyAccess(
        ts.createIdentifier("customElements"),
        ts.createIdentifier("define")
      ),
      undefined,
      [ts.createStringLiteral(Tag), ts.createIdentifier(Classname)]
    )
  );
}

function ManagerDefine(Classname: string) {
  return ts.createStatement(
    ts.createCall(
      ts.createPropertyAccess(
        ts.createIdentifier(Classname),
        ts.createIdentifier("$Constr")
      ),
      undefined,
      []
    )
  );
}

const DashCase = (name: string) =>
  name.replace(/([A-Z])/g, g => `-${g[0].toLowerCase()}`);
const SpliceDecorator = (
  node: ts.Node,
  Condition: (x: ts.Decorator) => boolean
) => {
  if (!node.decorators) return;
  const Dec = node.decorators.findIndex(Condition);
  if (Dec > -1) {
    const R = node.decorators[Dec];
    const Decs = Array.from(node.decorators);
    Decs.splice(Dec, 1);
    if (Decs && Decs.length) {
      node.decorators =  ts.createNodeArray(Decs);
    } else {
      delete node.decorators;
    }
    return R;
  }
};

const CustomElementDecorator = (node: SClass) => {
  const CustomElement = SpliceDecorator(
    node,
    x =>
      ts.isPropertyAccessExpression(x.expression) &&
      ((x.expression as ts.PropertyAccessExpression)
        .expression as ts.Identifier).escapedText == "CustomElement"
  );
  const NamedManager = SpliceDecorator(
    node,
    x =>
      ts.isPropertyAccessExpression(x.expression) &&
      ((x.expression as ts.PropertyAccessExpression)
        .expression as ts.Identifier).escapedText == "Execute"
  );
  const Manager = SpliceDecorator(
    node,
    x => (x.expression as ts.Identifier).escapedText == "Execute"
  );
  if (CustomElement || Manager || NamedManager) {
    const name = node.name.getText();
    const ns = CustomElement
      ? (CustomElement.expression as ts.PropertyAccessExpression).name
          .getText()
          .toLowerCase()
      : "manager";
    const Key = NamedManager
      ? (NamedManager.expression as ts.PropertyAccessExpression).name.getText()
      : ns + DashCase(name);
    node.Tag = Key;
    const AssignTag = ts.createProperty(
      undefined,
      [ts.createModifier(ts.SyntaxKind.StaticKeyword)],
      "Tag",
      undefined,
      undefined,
      ts.createStringLiteral(Key)
    );
    const DOMDisable = ts.createProperty(
      undefined,
      [ts.createModifier(ts.SyntaxKind.StaticKeyword)],
      "DOM",
      undefined,
      undefined,
      ts.createFalse()
    );
    let Nodes: any[] = [AssignTag];
    if(NamedManager) Nodes.push(DOMDisable);
    Nodes = Nodes.concat(node.members);
    node = ts.updateClassDeclaration(
      node,
      node.decorators,
      node.modifiers,
      node.name,
      node.typeParameters,
      node.heritageClauses,
      ts.createNodeArray(Nodes)
    );
    const R = [node];
    R.push(ElementDefine((NamedManager ? "managed-" : "") + Key, node.name.text) as any);
    if (Manager || NamedManager) R.push(ManagerDefine(node.name.text) as any);
    return R;
  }
  return [node];
};

const ClassMembersVisitor = (Cls: SClass, context: ts.TransformationContext) => (
  node: ts.MemberExpression
) => {
  if (PostCSS.IsPostCSS(node)) {
    const IsStatic =
      node.parent &&
      node.parent.modifiers &&
      node.parent.modifiers.find(x => x.kind == ts.SyntaxKind.StaticKeyword);
    const Tag = IsStatic ? Cls.Tag : undefined;
    return PostCSS.AddBlock(node as ts.TaggedTemplateExpression, Tag);
  }
  return ts.visitEachChild(node, ClassMembersVisitor(Cls, context), context);
};

function CustomElementTransformer<T extends ts.Node>(): ts.TransformerFactory<
  T
> {
  return context => {
    const visit: ts.Visitor = node => {
      if (ts.isSourceFile(node))
        return ts.visitEachChild(node, child => visit(child), context);
      if (ts.isClassDeclaration(node)) {
        if (node.decorators) {
          const R = CustomElementDecorator(node);
          R[0] = ts.visitEachChild(
            R[0],
            ClassMembersVisitor(node, context),
            context
          );
          return R;
        }
        return ts.visitEachChild(
          node,
          ClassMembersVisitor(node, context),
          context
        );
      }
      else if(ts.isExpressionStatement(node) && PostCSS.IsPostCSS(node.expression)){
        return PostCSS.AddBlock(node.expression as ts.TaggedTemplateExpression);
      }
      return node;
    };
    return node => ts.visitNode(node, visit);
  };
}

export default {
  before: [CustomElementTransformer()]
};
