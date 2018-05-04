import { IAtom, createAtom } from "mobx";

// import nextId from 'utils/nextId';

let id = 0;

export default function nextId() {
  return id++;
};

interface IStateItem {
  atoms?: Map<string, IAtom>;
  proxy?: any; // TODO change to Proxy
}

const state: WeakMap<Object, IStateItem> = new WeakMap;
const proxyToRaw: WeakMap<Object, Object> = new WeakMap;

// cahce last unused atom
let cachedAtoms = [];

export function cacheAtom(atom: IAtom) {
  if (!atom.isBeingObserved) {
    cachedAtoms.push(atom);
  }
}

export function getAtomFromCache() {
  return cachedAtoms.pop();
}

export function getOrCreateAtom(target, key: PropertyKey) {
  return getAtom(target, key as string) || getAtomFromCache() || createAtom(`MobxNext@${nextId()}`);
}

export function isObservable(proxy: Object): boolean {
  return proxyToRaw.has(proxy);
}

export function raw(obj: Object) {
  return proxyToRaw.get(obj) || obj;
}

export function hasState(target): boolean {
  return state.has(target);
}

export function setProxy(target, proxy: any) {
  // add proxy <-> target mapping
  !proxyToRaw.has(proxy) && proxyToRaw.set(proxy, target);

  if (state.has(target)) {
    const stateItem: IStateItem = state.get(target);
    stateItem.proxy = proxy;
  } else {
    state.set(target, { proxy, atoms: new Map });
  }
}

export function getProxy(target) {
  const s = state.get(target);
  return s && s.proxy;
}

export function setAtom(target, property: string, atom: IAtom) {
  if (state.has(target)) {
    const stateItem: IStateItem = state.get(target);
    stateItem.atoms.set(property, atom);
  } else {
    const atoms = new Map;
    atoms.set(property, atom);
    state.set(target, { atoms });
  }
}

export function getAtom(target, property: string): IAtom {
  const atoms = state.has(target) && state.get(target).atoms;
  return atoms && atoms.get(property);
}

export function getAtomsOnChange(target, property: string): IAtom[] {
  const atoms = state.get(target).atoms;
  let res = [];
  if (atoms) {
    // 'all' means that we must notify observers on any data change:
    // - add new item
    // - override existing value
    atoms.has('all') && res.push(atoms.get('all'));
    property !== 'all' && atoms.has(property) && res.push(atoms.get(property));
  }

  return res;
}