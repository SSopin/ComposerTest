# ComposerTest
Test code for ThreeJS composer paired with React.

To run the app, install dependencies using `npm install` and then use `npm start` command to start the app.

## Test details

The main test code looks like this: 

```
    /** ======================================= *
     * ====== ↓ COMPOSER TEST IS HERE ↓  ====== *
     * ======================================== */

    // Uncomment one of the lines below, refresh the page and see the result. (One at a time)
    const composerAndTarget =
            createComposer(renderer);   // Fast
        // useMemo(() => createComposer(renderer), []);  // Slow

    /** ======================================= *
     * ====== ↑ COMPOSER TEST IS HERE ↑  ====== *
     * ======================================== */
```

Just uncomment one or the other line and refresh the page in the browser, like shown below: 

```
    const composerAndTarget = createComposer(renderer);   // Fast
```

or: 

```
    const composerAndTarget = useMemo(() => createComposer(renderer), []);  // Slow
```
