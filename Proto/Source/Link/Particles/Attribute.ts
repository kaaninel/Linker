import Particle from "Link/Particle";

export default class Attribute extends Particle {

  Property = {};

  static Prop(Target: any, Key: any){
    Attribute.Register(Target);
    Attribute.Getter(Key, function(this: Attribute) {
      return this.Property[Key];
    });
    Attribute.Setter(Key, function(this: Attribute, Value){
      if(!this.Property[Key] || Value !== this.Property[Key]) {
        this.Property[Key] = Value;
        this.Root.ReRender();
      }
    });
  }

  static Bool(Target: any, Key: any){
    Attribute.Register(Target);
    Attribute.Getter(Key, function(this: Attribute) {
      return this.Property[Key];
    });
    Attribute.Setter(Key, function(this: Attribute, Value){
      if(!this.Property[Key] || Value !== this.Property[Key]) {
        this.Property[Key] = Value;
        if(Value) this.Root.setAttribute(Key, "");
        else this.Root.removeAttribute(Key);
      }
    });
  }

  static DOM(Target: any, Key: any){
    Attribute.Register(Target);
    Attribute.Getter(Key, function(this: Attribute) {
      return this.Property[Key];
    });
    Attribute.Setter(Key, function(this: Attribute, Value){
      if(!this.Property[Key] || Value !== this.Property[Key]) {
        this.Property[Key] = Value;
        this.Root.setAttribute(Key, Value);
      }
    });
  }
}