import {
  TemplateResult,
  NodePart,
  DefaultTemplateProcessor,
  Part,
  noChange
} from "Link/Lit/lit-html";

export class Block {

  protected Parts: Part[] = [];
  constructor(private _Value?: any){}

  get Template(){
    return this._Value;
  }

  set Template(Val: any) {
    if(this._Value === Val) return;
    this._Value = Val;
    this.Parts.forEach(Part => {
      Part.setValue(this._Value);
      Part.commit();
    });
  }

  private $Assign(Part: Part){
    this.Parts.push(Part);
    Part.setValue(this._Value);
    Part.commit();
  }
}

//@ts-ignore
class LinkNodePart extends NodePart {
  commit(){
    const V = this._pendingValue;
    if(V instanceof Block) {
      //@ts-ignore
      V.$Assign(this);
      this._pendingValue = noChange;
    }
    super.commit();
  }

  private _commitIterable(value: any): void {
    if (!Array.isArray(this.value)) {
      this.value = [];
      this.clear();
    }
    const itemParts = this.value as LinkNodePart[];
    let partIndex = 0;
    let itemPart: LinkNodePart|undefined;

    for (const item of value) {
      itemPart = itemParts[partIndex];
      if (itemPart === undefined) {
        itemPart = new LinkNodePart(this.options);
        itemParts.push(itemPart);
        if (partIndex === 0) {
          itemPart.appendIntoPart(this as any);
        } else {
          itemPart.insertAfterPart(itemParts[partIndex - 1] as any);
        }
      }
      itemPart.setValue(item);
      itemPart.commit();
      partIndex++;
    }

    if (partIndex < itemParts.length) {
      itemParts.length = partIndex;
      this.clear(itemPart && itemPart!.endNode);
    }
  }
}

class LinkProcessor extends DefaultTemplateProcessor {
  //@ts-ignore
  handleTextExpression(Options){
    return new LinkNodePart(Options);
  }
}

const DefaultLinkProcessor = new LinkProcessor();


export class LinkTemplate extends TemplateResult {
  constructor(strings: TemplateStringsArray, values: any[]) {
    super(strings, values, "html", DefaultLinkProcessor as any);
  }

  getHTML() {
    const SelfClosing = super.getHTML().split("/>");
    for (let i = 0; i < SelfClosing.length - 1; i++) {
      const x = SelfClosing[i];
      let SignIndex = x.lastIndexOf("<");
      let IsSignValid = false;
      while (!IsSignValid) {
        const signature = x.substr(SignIndex + 1);
        const QMatch = signature.match(/"/g);
        if (QMatch) {
          if (QMatch.length % 2 === 0) {
            IsSignValid = true;
          } else {
            SignIndex = x.substr(SignIndex).lastIndexOf("<");
          }
        } else {
          IsSignValid = true;
        }
      }
      const TagMatch = x.substr(SignIndex + 1).match(/[\w-]+/);
      if (TagMatch) {
        SelfClosing[i] = `${x}></${TagMatch[0]}>`;
      }
    }
    return SelfClosing.join("");
  }
}


export const html = (strings: TemplateStringsArray, ...values: any[]) =>
  new LinkTemplate(strings, values);

export const css = (strings: TemplateStringsArray, ...values: any[]) =>
//@ts-ignore
  new TemplateResult(strings, values, "html", DefaultLinkProcessor);
