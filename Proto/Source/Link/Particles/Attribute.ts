import Particle from "Link/Particle";

export default class Attribute extends Particle {
  static Prop(Target: any, Key: any) {
    Attribute.Storage(Target, Key);
    Attribute.On(Target, `PropChange$${Key}`, function(this: Attribute) {
      this.Root.ReRender();
    });
  }

  static Bool(Target: any, Key: any) {
    Attribute.Storage(Target, Key);
    Attribute.On(Target, `PropChange$${Key}`, function(
      this: Attribute,
      { detail: { New } }
    ) {
      if (New) this.Root.setAttribute(Key, "");
      else this.Root.removeAttribute(Key);
    });
  }

  static DOM(Target: any, Key: any) {
    Attribute.Storage(Target, Key);
    Attribute.On(Target, `PropChange$${Key}`, function(
      this: Attribute,
      { detail: { New } }
    ) {
      this.Root.setAttribute(Key, New);
    });
  }
}
