#samletimer

find the bug.

please run:

```
npm install
npm run serve
```

- in the browse
- open F12 - console
- click stop
- can you see the *first* warning? <br>
    DS DSStoreManager emitEvent AppUIStore/timerStopGo called out of process
- expand the warning to see the stack<br>
    - emitEvent
    - emitEvent
    - emitEvent
    - main
- goto index.ts - line 40

```typescript
timerStopGo.emitEvent(true);
```

- dependingState relays on events and the processing of the them.<br>
    DSStoreManager.process() handles them (and store.isDirty and the ui update).

- you can call events within the process function<br>
    please wrap the emitEvent like so.

```typescript
    appStoreManager.process("start timer", ()=>{
        timerStopGo.emitEvent(true);
    });
```

- the first waring is gone, but another shows up.
    expand the warning<br>
    
    - emitUIUpdate	@	DSStoreManager.ts
    - emitUIUpdate	@	DSValueStore.ts
    - valueChanged	@	DSStateValue.ts
    - handleTick

- Please search for // hint1<br>
    Normally you have to figure out what to do, but for now their is the solution right away.

- Now you should see no more warnings. Right?
- Please click the buttons Stop, Go, Stop
- Can you fix the bug?
If you need help search for // hint2