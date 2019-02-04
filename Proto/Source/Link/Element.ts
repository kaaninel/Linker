import { TemplateResult, render } from "Link/Lit/lit-html";
import Particle from "./Particle";

declare global {
  const CustomElement: Record<string, (Ctor: Function) => any>;
}

const enum ElementStages {
  Disconnected,
  Idle,
  Busy
}

export const NextCycle = (Fn: Function) => setTimeout(Fn, 0);

const GlobalStyle = document.createElement("style");
document.head.appendChild(GlobalStyle);

export default class LinkElement extends HTMLElement {
  static Tag: string;
  static Style: TemplateResult;
  static Particles: Record<string, typeof Particle> = {};

  Root: HTMLElement = this;
  Slot: Node[] = undefined;
  Particles: Record<string, Particle> = {};
  Stage = ElementStages.Disconnected;

  Getters: Record<string, Function[]> = {};
  Setters: Record<string, Function[]> = {};

  DefineProp(Key, Context) {
    if (!(Key in this.Getters)) {
      this.Getters[Key] = [];
      this.Setters[Key] = [];
      Object.defineProperty(this, Key, {
        get(this: LinkElement) {
          return this.Getters[Key].reduce(
            (y, x) => x.call(Context, y),
            undefined
          );
        },
        set(this: LinkElement, Value: any) {
          return this.Setters[Key].reduce(
            (y, x) => x.call(Context, Value, y),
            undefined
          );
        }
      });
    }
  }

  SetGetter(Context: any, Key: string, Fn: (BV?: any) => any) {
    this.DefineProp(Key, Context);
    this.Getters[Key].push(Fn);
  }

  SetSetter(Context: any, Key: string, Fn: (CV: any, BV?: any) => any) {
    this.DefineProp(Key, Context);
    this.Setters[Key].push(Fn);
  }

  SetGetters(Context: any, Key: string, Fns: Array<(BV?: any) => any>) {
    this.DefineProp(Key, Context);
    this.Getters[Key] = this.Getters[Key].concat(Fns);
  }

  SetSetters(
    Context: any,
    Key: string,
    Fns: Array<(CV: any, BV?: any) => any>
  ) {
    this.DefineProp(Key, Context);
    this.Setters[Key] = this.Setters[Key].concat(Fns);
  }
  constructor() {
    super();
    const ParticlePrototypes = (this.constructor as typeof LinkElement)
      .Particles;
    for (const PP in ParticlePrototypes)
      this.Particles[PP] = new ParticlePrototypes[PP](this);
    NextCycle(() => this.$Constr());
  }

  Render(Template: any) {
    render(Template, this.Root, { eventContext: this });
    if (this.Rendered) {
      this.CalcParticle("Rendered");
      this.Rendered();
    }
  }

  ReRender() {
    if (this.Template) this.Render(this.Template());
  }

  CalcParticle(Stage: string) {
    for (const K in this.Particles) {
      const Fn = this.Particles[K].constructor[Stage];
      if (Fn) Fn(this);
    }
  }

  connectedCallback() {
    if (!this.Slot) this.Slot = Array.from(this.childNodes);
    this.Stage = ElementStages.Idle;
    this.CalcParticle("Connected");
    this.RequestCycle("Connected");
  }

  Template?(): TemplateResult;
  Constr?(): Promise<void> | void;
  Update?(): Promise<void> | void;
  Rendered?(): void;

  disconnectedCallback() {
    this.Stage = ElementStages.Disconnected;
    this.CalcParticle("Disconnected");
  }

  RequestCycle(Reason: string) {
    if (this.Stage === ElementStages.Idle) NextCycle(() => this.$Cycle());
  }

  async $Constr() {
    this.CalcParticle("Constr");
    if (this.Constr) await this.Constr();
    //this.RequestCycle("Init");
  }

  async $Cycle() {
    if (this.Stage !== ElementStages.Idle) return;
    this.Stage = ElementStages.Busy;
    this.CalcParticle("Update");
    if (this.Update) await this.Update();

    this.ReRender();
    this.Stage = ElementStages.Idle;
  }
}
