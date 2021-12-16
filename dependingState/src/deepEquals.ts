export function deepEquals(
  a: unknown,
  b: unknown,
  ignoreStateVersion: boolean
) {
  if (a === b) { return true; }

  if (a && b && typeof a == 'object' && typeof b == 'object') {
    if (a.constructor !== b.constructor) {
      return false;
    }

    if (Array.isArray(a)) {
      let length = (a as unknown[]).length;
      if (length != (b as unknown[]).length) {
        return false;
      }
      for (let i = length - 1; i >= 0; i--) {
        if (!deepEquals((a as unknown[])[i], (b as unknown[])[i], false)) {
          return false;
        }
      }
      return true;
    }


    if ((a instanceof Map) && (b instanceof Map)) {
      if (a.size !== b.size) {
        return false;
      }
      for (let i of a.entries()) {
        if (!b.has(i[0])) {
          return false;
        }
      }

      for (let i of a.entries()) {
        if (!deepEquals(i[1], b.get(i[0]), false)) {
          return false;
        }
      }
      return true;
    }

    if ((a instanceof Set) && (b instanceof Set)) {
      if (a.size !== b.size) {
        return false;
      }
      for (let i of a.entries()) {
        if (!b.has(i[0])) {
          return false;
        }
      }
      return true;
    }

    if (ArrayBuffer.isView(a) && ArrayBuffer.isView(b)) {
      let length = (a as any).length;
      if (length != (b as any).length) {
        return false;
      }
      for (let i = length - 1; i >= 0; i--) {
        if ((a as any)[i] !== (b as any)[i]) {
          return false;
        }
      }
      return true;
    }


    if (a.constructor === RegExp) return (a as any).source === (b as any).source && (a as any).flags === (b as any).flags;
    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
    {
      let aKeys = Object.keys(a);
      let bKeys = Object.keys(b);
      if (ignoreStateVersion) {
        {
          let i = aKeys.indexOf("stateVersion");
          if (i >= 0) {
            aKeys.splice(i, 1);
          }
        }
        {
          let i = bKeys.indexOf("stateVersion");
          if (i >= 0) {
            bKeys.splice(i, 1);
          }
        }
      }
      if (aKeys.length !== bKeys.length) {
        return false;
      }

      for (let i = aKeys.length - 1; i >= 0; i--) {
        if (Object.prototype.hasOwnProperty.call(a, aKeys[i])) {
          if (!Object.prototype.hasOwnProperty.call(b, aKeys[i])) {
            return false;
          }
        }
      }

      for (let i = aKeys.length - 1; i >= 0; i--) {
        var key = aKeys[i];

        if (!deepEquals((a as any)[key], (b as any)[key], false)) {
          return false;
        }
      }
    }
    return true;
  } else {
    // true if both NaN, false otherwise
    return a !== a && b !== b;
  }
}