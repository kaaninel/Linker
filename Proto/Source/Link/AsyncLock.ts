export default class AsyncLock {
  static Store: Map<Object, [Function, Function]> = new Map();

  static Lock(
    Key: Object,
    Options?: {
      Override?: boolean;
      Timeout?: number;
      Value?: string;
      Throw?: boolean;
    }
  ) {
    const OptionsD = {
      Override: false,
      Throw: true,
      Timeout: -1,
      Value: `${Key} Timeout`,
      ...Options
    };
    if (this.Store.has(Key) && !OptionsD.Override)
      throw new Error(`${Key} already exists in AsyncLock.Store`);
    return new Promise((Res, Rej) => {
      this.Store.set(Key, [Res, Rej]);
      if (OptionsD.Timeout > -1) {
        const Timeout = setTimeout(() => {
          this.Unlock(Key, OptionsD.Value, OptionsD.Throw, Timeout);
        }, OptionsD.Timeout);
      }
    });
  }

  static Unlock(
    Key: Object,
    Value: any,
    Throw: boolean = false,
    Timeout?: number
  ) {
    const [Res, Rej] = this.Store.get(Key);
    if (Throw) Rej(Value);
    else Res(Value);
    if (Timeout) clearTimeout(Timeout);
    this.Store.delete(Key);
  }
}
