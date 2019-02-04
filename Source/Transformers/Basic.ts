import * as ts from "typescript";

type ModuleIEDec = (ts.ImportDeclaration | ts.ExportDeclaration) & { Org?: ts.StringLiteral };

function ImportVisitor<T extends ts.Node>(Fn: (node: ModuleIEDec) => void | ts.Node): ts.TransformerFactory<T> {
  return (context) => {
    const visit: ts.Visitor = (node) => {
      if(ts.isSourceFile(node))
        return ts.visitEachChild(node, (child) => visit(child), context);
      if(ts.isImportDeclaration(node) || ts.isExportDeclaration(node)){
        const R = Fn(node);
        if(R) return R;
      } 
      return ts.visitEachChild(node, (child) => visit(child), context);
    }
    return (node) => ts.visitNode(node, visit);
  };
}

const SelfClosingRegex = /<([\w-]+)(?:\s+(?:[\w-]+=\"[^"]*\"))*\s*\/>/gm;

const RegexTransform = (Text: string) => {
  const R = SelfClosingRegex.exec(Text);
  if(!R) return false;
  return `${Text.substring(0, Text.length - 2)}><${R[1]}>`
}

const TaggedTemplateVisitor = (Cls: ts.TaggedTemplateExpression, context) => ((node: ts.MemberExpression) => {
  if(Cls.tag.getText() === "html"){
    const T = Cls.template;
    if(ts.isTemplateExpression(T)) {
    }
  }
  return ts.visitEachChild(node, TaggedTemplateVisitor(Cls, context), context);
}) as ts.Visitor;

function HTMLTransformer<T extends ts.Node>(): ts.TransformerFactory<T> {
  return context => {
    const visit: ts.Visitor = node => {
      if (ts.isSourceFile(node))
        return ts.visitEachChild(node, child => visit(child), context);
      if (ts.isTaggedTemplateExpression(node)) 
        return TaggedTemplateVisitor(node, context);
      return ts.visitEachChild(
        node,
        visit,
        context
      );
    };
    return node => ts.visitNode(node, visit);
  };
}

export default {
  before: [
    //HTMLTransformer()
  ],
  after: [
    ImportVisitor((Node) => {
      if(Node.moduleSpecifier && ts.isStringLiteral(Node.moduleSpecifier)){
        let m = Node.moduleSpecifier.text;
        if(!m.endsWith(".js")) m += ".js"
        if(!m.startsWith(".")) {
          if(!m.startsWith("/Lib/")) m = "/Lib/" + m;
        }
        if(ts.isImportDeclaration(Node)){
          return ts.updateImportDeclaration(Node, Node.decorators, Node.modifiers, Node.importClause, ts.createStringLiteral(m));
        }
        else if(ts.isExportDeclaration(Node)){
          return ts.updateExportDeclaration(Node, Node.decorators, Node.modifiers, Node.exportClause, ts.createStringLiteral(m));
        }
      }
    })
  ]
}