import Particle from "Link/Particle";

const LineThrough = (Text: string) =>
  Text.replace(/([A-Z])/g, (A, B, C, D) => {
    const F = A[0].toLowerCase();
    if (C) return `-${F}`;
    else return F;
  });

function StyleVar(Target: any, Key: any, Unit?: string) {
  Style.Storage(Target, Key);
  Style.On(Target, Key, function(this: Style, { detail: { New } }) {
    this.Root.style.setProperty(
      `--${LineThrough(Key)}`,
      Unit ? New + Unit : New
    );
  });
}

export default class Style extends Particle {
  static Var = new Proxy(StyleVar, {
    get(Target: Function, Unit: string) {
      if (Unit === "perc") Unit = "%";
      return (Target: any, Key: any) => StyleVar(Target, Key, Unit);
    }
  }) as typeof StyleVar & Record<string, typeof StyleVar>;
}
