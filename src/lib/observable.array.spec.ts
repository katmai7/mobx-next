import test from 'ava';
import observable from './observable';
import { autorun, reaction, action } from 'mobx';
import * as sinon from 'sinon';

import { isObservable } from './global';

function initDataForTest() {
  const array = [7, 10];
  const proxy: Array<number> = observable(array);
  const autoRunSpy = sinon.spy();
  const reactionSpy = sinon.spy();

  return { array, proxy, autoRunSpy, reactionSpy };
}

test('should call reaction/autorun on arr element set', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy[0],
    val => reactionSpy(val)
  );
  autorun(() => {
    proxy[0];
    autoRunSpy();
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);

  proxy[0] = 20;

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.lastCall.args[0], 20);
  t.is(autoRunSpy.callCount, 2);
});

test('should NOT call reaction/autorun on arr element set same value', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy[0],
    val => reactionSpy(val)
  );
  autorun(() => {
    proxy[0];
    autoRunSpy();
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);

  proxy[0] = 7; // updated to the same value

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
});

test('should call reaction/autorun on arr length change', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.length,
    val => reactionSpy(val)
  );
  autorun(() => {
    autoRunSpy(proxy.length);
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
  t.is(autoRunSpy.lastCall.args[0], 2);

  proxy.length = 3;

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.lastCall.args[0], 3);
  t.is(autoRunSpy.callCount, 2);
  t.is(autoRunSpy.lastCall.args[0], 3);

  proxy.length = 1;

  t.is(reactionSpy.callCount, 2);
  t.is(reactionSpy.lastCall.args[0], 1);
  t.is(autoRunSpy.callCount, 3);
  t.is(autoRunSpy.lastCall.args[0], 1);
});

test('should call reaction/autorun on array change with push', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.join(),
    val => reactionSpy(val)
  );
  autorun(() => {
    autoRunSpy(proxy.join());
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
  t.is(autoRunSpy.lastCall.args[0], '7,10');

  proxy.push(1);

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.lastCall.args[0], '7,10,1');
  t.is(autoRunSpy.callCount, 2);
  t.is(autoRunSpy.lastCall.args[0], '7,10,1');
});

test('should call reaction/autorun on array change with pop', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.join(),
    val => reactionSpy(val)
  );
  autorun(() => {
    autoRunSpy(proxy.join());
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
  t.is(autoRunSpy.lastCall.args[0], '7,10');

  proxy.pop();

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.lastCall.args[0], '7');
  t.is(autoRunSpy.callCount, 2);
  t.is(autoRunSpy.lastCall.args[0], '7');
});

test('should call reaction/autorun on array change with shift', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.join(),
    val => reactionSpy(val)
  );
  autorun(() => {
    autoRunSpy(proxy.join());
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
  t.is(autoRunSpy.lastCall.args[0], '7,10');

  proxy.shift();

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.lastCall.args[0], '10');
  t.is(autoRunSpy.callCount, 2);
  t.is(autoRunSpy.lastCall.args[0], '10');
});

test('should call reaction/autorun on array change with unshift', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.join(),
    val => reactionSpy(val)
  );
  autorun(() => {
    autoRunSpy(proxy.join());
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
  t.is(autoRunSpy.lastCall.args[0], '7,10');

  proxy.unshift(2);

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.lastCall.args[0], '2,7,10');
  t.is(autoRunSpy.callCount, 2);
  t.is(autoRunSpy.lastCall.args[0], '2,7,10');
});

test('should call reaction/autorun on array change with splice', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.join(),
    val => reactionSpy(val)
  );
  autorun(() => {
    autoRunSpy(proxy.join());
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
  t.is(autoRunSpy.lastCall.args[0], '7,10');

  proxy.splice(1, 1);

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.lastCall.args[0], '7');
  t.is(autoRunSpy.callCount, 2);
  t.is(autoRunSpy.lastCall.args[0], '7');
});

test('should call reaction/autorun on array change with reverse', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.join(),
    val => reactionSpy(val)
  );
  autorun(() => {
    autoRunSpy(proxy.join());
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
  t.is(autoRunSpy.lastCall.args[0], '7,10');

  proxy.reverse();

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.lastCall.args[0], '10,7');
  t.is(autoRunSpy.callCount, 2);
  t.is(autoRunSpy.lastCall.args[0], '10,7');
});

test('should call reaction/autorun on array change with sort', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.join(),
    val => reactionSpy(val)
  );
  autorun(() => {
    autoRunSpy(proxy.join());
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
  t.is(autoRunSpy.lastCall.args[0], '7,10');

  proxy.sort((a, b) => b - a);

  t.is(reactionSpy.callCount, 1);
  t.is(reactionSpy.lastCall.args[0], '10,7');
  t.is(autoRunSpy.callCount, 2);
  t.is(autoRunSpy.lastCall.args[0], '10,7');
});

test('should call reaction/autorun on array length change', t => {
  const { proxy, autoRunSpy, reactionSpy } = initDataForTest();

  reaction(
    () => proxy.join(),
    val => reactionSpy(val)
  );
  autorun(() => {
    autoRunSpy(proxy.join());
  });

  t.is(reactionSpy.callCount, 0);
  t.is(autoRunSpy.callCount, 1);
  t.is(autoRunSpy.lastCall.args[0], '7,10');

  proxy.push(20, 30);
  t.is(reactionSpy.lastCall.args[0], '7,10,20,30');

  proxy.length = 1;

  t.is(reactionSpy.callCount, 2);
  t.is(reactionSpy.lastCall.args[0], '7');
  t.is(autoRunSpy.callCount, 3);
  t.is(autoRunSpy.lastCall.args[0], '7');
});