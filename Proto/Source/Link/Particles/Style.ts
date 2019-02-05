import Particle from "Link/Particle";

const LineThrough = (Text: string) =>
  Text.replace(/([A-Z])/g, (A, B, C, D) => {
    const F = A[0].toLowerCase();
    if (C) return `-${F}`;
    else return F;
  });

function StyleVar(Target: any, Key: any, Unit?: string) {
  Style.Register(Target);
  Style.Getter(Key, function(this: Style) {
    return this.Vars[Key];
  });
  Style.Setter(Key, function(this: Style, Value) {
    if (!this.Vars[Key] || Value !== this.Vars[Key]) {
      this.Vars[Key] = Value;
      this.Root.style.setProperty("--" + LineThrough(Key), Unit ? Value + Unit : Value);
    }
  });
}

export default class Style extends Particle {
  Vars = {};

  static Var = new Proxy(StyleVar, {
    get(Target: Function, Unit: string){
      if(Unit === "perc") Unit = "%";
      return (Target: any, Key: any) => StyleVar(Target, Key, Unit);
    }
  }) as typeof StyleVar & Record<string, typeof StyleVar>;

}


