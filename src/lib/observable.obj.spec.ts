import test from 'ava';
import observable from './observable';
import { autorun, reaction, action } from 'mobx';
import * as sinon from 'sinon';

import { isObservable } from './global';

function initDataForTest() {
  const obj = { test: 7 };
  const proxy = observable(obj);
  const autoRunSpy = sinon.spy();
  const reactionSpy = sinon.spy();

  return { obj, proxy, autoRunSpy, reactionSpy };
}

test('should call reaction/autorun on prop set', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.test,
    val => reactionSpy(val)
  );
  autorun(() => {
    proxy.test;
    autoRunSpy();
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);

  proxy.test = 10;

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.firstCall.args[0], 10);
  t.is(autoRunSpy.callCount, 2);
});

test('should call reaction/autorun only once on multiple props seting within action', t => {
  const { autoRunSpy, reactionSpy } = initDataForTest();
  const obj = { test: 7, test2: 10 };
  let proxy = observable(obj);

  const doAction = action(() => {
    proxy.test = 10;
    proxy.test2 = 20;
  });

  reaction(
    () => proxy.test + proxy.test2,
    val => reactionSpy(val)
  );
  autorun(() => {
    proxy.test;
    autoRunSpy();
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);

  doAction();

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.firstCall.args[0], 30);
  t.is(autoRunSpy.callCount, 2);
});

test('should call reaction/autorun on NEW prop set', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.test2, // proxy.test2 is undefiend
    val => reactionSpy(val)
  );
  autorun(() => {
    proxy.test2;
    autoRunSpy();
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);

  proxy.test = 10;

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);

  proxy.test2 = 20;

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.firstCall.args[0], 20);
  t.is(autoRunSpy.callCount, 2);
});

test('should NOT call reaction/autorun on not observable property', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.test,
    val => reactionSpy(val)
  );
  autorun(() => {
    proxy.test;
    autoRunSpy();
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);

  proxy.test2 = 10; // new dynamic property

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
});

test('should call reaction/autorun on prop delete', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.test,
    val => reactionSpy(val)
  );

  autorun(() => {
    proxy.test;
    autoRunSpy();
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);

  delete proxy.test;

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.firstCall.args[0], undefined);
  t.is(autoRunSpy.callCount, 2);
});

test('should call reaction/autorun on "has" operation', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => 'test' in proxy,
    val => reactionSpy(val)
  );

  autorun(() => {
    'test' in proxy;
    autoRunSpy();
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);

  proxy.test = 10;

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 2);

  delete proxy.test;

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.firstCall.args[0], false);
  t.is(autoRunSpy.callCount, 3);
});

test('should call reaction/autorun on "ownKeys" operation', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => Object.keys(proxy),
    keys => reactionSpy(keys)
  );

  autorun(() => {
    Object.keys(proxy);
    autoRunSpy();
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);

  proxy.test2 = 100;  // set new prop

  t.is(reactionSpy.callCount, 1);
  t.deepEqual(reactionSpy.firstCall.args[0], ['test', 'test2']);
  t.is(autoRunSpy.callCount, 2);
});

// test dynamic creating observable object

test('should create dynamically observable object', t => {
  const { autoRunSpy, reactionSpy } = initDataForTest();
  const obj = {
    test: 7,
    test2: { prop: 7 },
  };

  const proxy = observable(obj);

  t.is(isObservable(proxy), true);
  t.is(isObservable(proxy.test2), false);

  reaction(
    () => proxy.test2.prop,
    val => reactionSpy(val)
  );

  t.is(isObservable(proxy.test2), true);
  // should be equal
  t.is(proxy.test2, proxy.test2);
});
