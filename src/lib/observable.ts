import { createAtom, action, runInAction, IAtom } from 'mobx';

import { setAtom, getAtom, getAtomsOnChange, hasState, getProxy, setProxy, raw, isObservable } from './global';
import { getHandlers } from './handlers';

export default function observable(target) {
  if (hasState(target)) {
    return getProxy(target);
  }
  const proxy = createProxy(target);
  setProxy(target, proxy);

  return proxy;
}

// TODO how to delete atom, when thre are no observers already
function createProxy(target) {
  return new Proxy(target, getHandlers(target));
}
