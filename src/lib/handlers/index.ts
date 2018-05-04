import * as baseHandlers from './base';

const typeToHandlersMap = new Map<Object, Object>([

]);

export function getHandlers(obj: object) {
  return typeToHandlersMap.get(obj.constructor) || baseHandlers;
}