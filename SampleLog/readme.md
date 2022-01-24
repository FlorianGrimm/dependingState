#samle simple

find the bug.

please run:

```
npm install
npm run serve
```

- open the F12 - console
- click clickinfo
- you see<br>
    handleClick {hello: 'world'}
- the dsLog.setEnabled(); enables the logging
- in the src/index.ts you can see this at the top
```typescript
    // initialize log
    dsLog.initialize();

    // remove this if going productive
    dsLog.setEnabled();
```

- if you remove setEnabled you can see no more logs

```typescript
    // initialize log
    dsLog.initialize();

    // remove this if going productive
    // dsLog.setEnabled();    
```

(or if you disable it)

```typescript
    // initialize log
    dsLog.initialize();

    // remove this if going productive
    // dsLog.setEnabled();
    dsLog.setDisabled();
```

- clickinfo -- you see no console output

- this good for productive mode. 

- You can switch this on or off with an window.localStorage "setting".

- Modify the code to this

```typescript
    // initialize log
    dsLog.initialize();

    // remove this if going productive
    dsLog.setEnabled();
    dsLog.saveToLocalStorage();
```

- Now you see this in the console<br>
    window.localStorage.setItem('dsLog', '{"mode":"enabled"}');<br>
    Please copy this line
    
- Please remove the 2 lines

```typescript
    // initialize log
    dsLog.initialize();

    // remove this if going productive
```
- click clickinfo - an you see the no log.

- In the browser-console please write this (it's in the clipboard)

```javascript
window.localStorage.setItem('dsLog', '{"mode":"enabled"}');
```

- reload the browser - click clickinfo - an you see the log again.


- In the browser-console please write this 

```javascript
window.localStorage.setItem('dsLog', '{"mode":"disabled"}');
```

- reload the browser - click clickinfo - an you see no log.

- so you can switch the log on in productive code.

- sometime logging is "expensive" if you use string interpolation, or ... you should avoid this for production mode. So modify the code like that.

```typescript
    // initialize log
    dsLog.initialize();

    // remove this if going productive
    dsLog.setWarnIfCalled();
```

- click clickinfo - click clickinfo2

- can you fix the warning?


- TODO dsLog.setWatchout

- TODO appStoreManager