import { OktaAuthBaseInterface, OktaAuthConstructor } from '../base/types';
import {
  OktaAuthStorageInterface,
  OktaAuthStorageOptions,
  StorageManagerConstructor,
  StorageManagerInterface,
} from './types';

export function mixinStorage
<
  S extends StorageManagerInterface = StorageManagerInterface,
  O extends OktaAuthStorageOptions = OktaAuthStorageOptions,
  TBase extends OktaAuthConstructor<OktaAuthBaseInterface<O>> = OktaAuthConstructor<OktaAuthBaseInterface<O>>
>
(
  Base: TBase, StorageManager: StorageManagerConstructor<S>
): TBase & OktaAuthConstructor<OktaAuthStorageInterface<S, O>>
{
  return class OktaAuthStorage extends Base implements OktaAuthStorageInterface<S, O>
  {
    storageManager: S;
    constructor(...args: any[]) {
      super(...args);
      const { storageManager, cookies, storageUtil } = this.options;
      this.storageManager = new StorageManager(storageManager!, cookies!, storageUtil!);
    }
    clearStorage(): void {
      // override in subclass
    }
  };
}
