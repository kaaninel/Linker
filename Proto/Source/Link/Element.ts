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

export default class LinkElement extends HTMLElement {
  static Tag: string;
  static Style: TemplateResult;
  static Particles: Record<string, typeof Particle> = {};

  Root: HTMLElement = this;
  Slot: Node[] = undefined;
  Particles: Record<string, Particle> = {};
  Stage = ElementStages.Disconnected;

  Store: Record<string, any> = {};
  Getters: Record<string, Array<[string, Function]>>;
  Setters: Record<string, Array<[string, Function]>>;
  Events: Record<string, Array<[string, Function]>>;
  Storage: Record<string, boolean>;

  DefineProp(Key) {
    if (!(Key in this.Store)) {
      this.Store[Key] = undefined;
      Object.defineProperty(this, Key, {
        get(this: LinkElement) {
          const Getters = this.Getters && this.Getters[Key];
          return Getters
            ? Getters.reduce(
                (y, x) => x[1].call(this.Particles[x[0]], y),
                this.Store[Key]
              )
            : this.Store[Key];
        },
        set(this: LinkElement, Value: any) {
          const Setters = this.Setters && this.Setters[Key];
          const New = Setters
            ? Setters.reduce(
                (y, x) =>
                  x[1].call(this.Particles[x[0]], y, Value, this.Store[Key]),
                Value
              )
            : Value;
          const Old = this.Store[Key];
          if (Old !== New) {
            this.Store[Key] = New;
            const C = this.dispatchEvent(
              new CustomEvent(`PropChange$${Key}`, {
                detail: { Key, Old, New }
              })
            );
            if (!C) this.Store[Key] = Old;
          }
        }
      });
    }
  }

  constructor() {
    super();
    const ParticlePrototypes = (this.constructor as typeof LinkElement)
      .Particles;
    for (const PP in ParticlePrototypes)
      this.Particles[PP] = new ParticlePrototypes[PP](this);
    for (const G in this.Getters) this.DefineProp(G);
    for (const G in this.Setters) this.DefineProp(G);
    for (const G in this.Storage) this.DefineProp(G);
    for (const G in this.Events) {
      const Event = this.Events[G];
      Event.forEach(x => {
        this.addEventListener(G, x[1].bind(this.Particles[x[0]]));
      });
    }

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
