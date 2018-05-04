import { createAtom, action, runInAction, IAtom } from 'mobx';

import { setAtom, getAtom, getAtomsOnChange, getOrCreateAtom, hasState, getProxy, setProxy, raw, isObservable, getAtomFromCache, cacheAtom } from '../global';
import observable from '../observable';

const mutatedMethods = ['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'];

// Handlers for Object, Array

// TODO: do not observe frozen object, or not writable and configurable objects
export function get(target, key, receiver) {
  const res = Reflect.get(target, key, receiver);
  if (typeof key === 'symbol') {
    return res;
  }

  if (typeof res === 'function') {
    return observable(res);
  }

  const atom = getOrCreateAtom(target, key);
  const isReactiveContext = atom.reportObserved();
  if (isReactiveContext) {
    setAtom(target, key as string, atom);
  } else {
    // TODO there is can be stored atom but not using in reaction, so don't cache it
    cacheAtom(atom);
  }

  // const observableRes = getProxy(res);
  // Q: how to better check that 'res' is not primitive value
  // Q: should create separated proxy for function?
  // NOTE: function can have static props
  if (isReactiveContext && res && typeof res === 'object' && res !== null) {
    return observable(res);
  }

  return getProxy(res) || res;
}

export function has(target, key) {
  const atom = getOrCreateAtom(target, key);
  const isReactiveContext = atom.reportObserved();
  if (isReactiveContext) {
    setAtom(target, key as string, atom);
  } else {
    cacheAtom(atom);
  }
  return Reflect.has(target, key);
}

export function ownKeys(target) {
  // TODO think about 'all' and prop atom relations
  const atom = getOrCreateAtom(target, 'all');

  const isReactiveContext = atom.reportObserved();
  if (isReactiveContext) {
    setAtom(target, 'all', atom);
  } else {
    cacheAtom(atom);
  }
  atom.reportObserved();
  return Reflect.ownKeys(target);
}

export function apply(target, value, args) {
  // 'value' is a proxied object, so convert it to raw objecct
  const rawValue = raw(value);
  let res;

  if (rawValue.constructor === Array) {
    const notifyObservers = mutatedMethods.includes(target.name);
    res = Reflect.apply(target, rawValue, args); // apply function to raw object

    if (notifyObservers) {
      const atom = getAtom(rawValue, 'all');
      atom && atom.reportChanged();
    } else {
      const atom = getOrCreateAtom(rawValue, 'all');
      const isReactiveContext = atom.reportObserved();
      if (isReactiveContext) {
        setAtom(rawValue, 'all', atom);
      } else {
        cacheAtom(atom);
      }
    }
  } else {
    // for non builtin data types, run method in mobx action
    res = runInAction(Reflect.apply(target, value, args));
  }

  return res;
}

export function set(target, key, value, receiver) {
  const prevValue = target[key];
  const atoms = getAtomsOnChange(target, key as string);

  const res = Reflect.set(target, key, value, receiver);
  if (prevValue !== value) {
    atoms.forEach(atom => atom.reportChanged());
  }

  return res;
}

export function deleteProperty(target, key) {
  const atoms = getAtomsOnChange(target, key as string);

  const res = Reflect.deleteProperty(target, key);
  atoms.forEach(atom => atom.reportChanged());
  return res;
}