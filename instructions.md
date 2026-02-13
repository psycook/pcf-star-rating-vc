# Vibe-Code a PCF Component from Scratch

## What We're Building
A **PowerApps Component Framework (PCF) virtual control** that renders an interactive star rating. Stars scale to fill their container, support hover highlighting, and write the selected rating back to a Dataverse whole-number column. It uses **React 16** and **Fluent UI v9** (provided by the platform).

ComponentName is StarRating
Namespace is researchworkbench
Prefix is smc

## Step 1 — Scaffold the PCF project
pac pcf init --namespace [Namespace] --name [ComponentName] --template field --framework react --run-npm-install

Key flags:
- `--template field` — this is a field-bound control (it reads/writes a single column value).
- `--framework react` — scaffolds a React-based virtual control. Virtual controls share the host's React/Fluent instances, so no bundle bloat.
After scaffolding you'll have: `[ComponentName]/ControlManifest.Input.xml`, `[ComponentName]/index.ts`, `package.json`, `tsconfig.json`, etc.

## Step 2 — Define the manifest (`[ComponentName]/ControlManifest.Input.xml`)
Replace the default `<property>` entries inside the `<control>` element so the manifest declares these new properties:
rating, number, bound
maxStars, number, input and output, default value 5
readOnly, boolean, input and output, default value false

In the `<resources>` section, make sure the platform libraries are declared (the scaffolder adds these for `--framework react`, but verify):
React 16.14.0
Fluent 9.46.2

After editing the manifest, regenerate types:

npm run refreshTypes

This updates `[ComponentName]/generated/ManifestTypes.d.ts` with `IInputs` and `IOutputs` interfaces matching your properties.

## Step 3 — Install Fluent UI
npm install @fluentui/react-components@9.46.2

(React and ReactDOM 16.14.0 should already be in the project from scaffolding.)

## Step 4 — Build the React component (`[ComponentName]]/[ComponentName]Component.tsx`)

Create a new file `[ComponentName]/[ComponentName]Component.tsx`. This is a pure presentational React component — it knows nothing about PCF.

### Design requirements

1. **Props interface (`I[ComponentName]Props`)**:
   - `rating: number` — current value
   - `maxStars?: number` — defaults to 5
   - `containerWidth?: number` — pixel width provided by PCF
   - `containerHeight?: number` — pixel height provided by PCF
   - `readOnly?: boolean` — disables pointer interaction
   - `onChange?: (rating: number) => void` — callback when user clicks a star

2. **Star SVG sub-component**: Each star is an inline `<svg>` with a 5-pointed star `<path>`. Filled stars are gold (`#FFD700`), empty stars have a light gray stroke (`#e1e1e1`) with transparent fill.

3. **Responsive sizing**: Calculate star size from the container dimensions so all stars (plus proportional gaps of ~20% of star size) fit without overflow. Clamp the minimum star size to 12px. Use the smaller of height-based and width-based calculations.

4. **Hover effect**: Track `hoverRating` state. On `pointerEnter` of star *i*, fill stars 1 through *i*. On `pointerLeave`, revert to the actual rating.

5. **Accessibility**: Each star SVG has `role="button"` (or `role="img"` in read-only mode) with an `aria-label` like "Rate 3 stars".

6. **Styling**: Use Fluent UI's `makeStyles` for the container (flexbox row, `justifyContent: 'flex-start'`). Dynamic values (gap, padding, width/height) go in inline `style`.

### Prompt to generate the component
> Create a React functional component in TypeScript called `[ComponentName]` (also export the props interface `I[ComponentName]Props`). It renders a row of SVG stars. It accepts `rating`, `maxStars` (default 5), `containerWidth`, `containerHeight`, `readOnly`, and an `onChange` callback. Stars dynamically size to fit the container using the smaller of width-based and height-based sizing. Filled stars are gold (#FFD700), unfilled are transparent with a #e1e1e1 stroke. Implement hover highlighting that fills stars up to the hovered index. When read-only, disable pointer events and use role="img" instead of role="button". Use `@fluentui/react-components` `makeStyles` for the outer flex container. Use `pointerDown`, `pointerEnter`, and `pointerLeave` events — not `click`/`mouseEnter`.

## Step 5 — Wire up the PCF harness (`[ComponentName]/index.ts`)
Edit the scaffolded `index.ts`. This is the glue between the PCF runtime and your React component.

### Key implementation points
1. **Class fields**: Store `notifyOutputChanged` callback and `currentRating: number`.
2. **`init()`**: Save `notifyOutputChanged`. Call `context.mode.trackContainerResize(true)` so `updateView` fires when the host resizes the control.
3. **`updateView()`**: Read parameters from `context.parameters`, compute props, and return `React.createElement([ComponentName]Component, props)`. The `onChange` callback should set `this.currentRating` and call `this.notifyOutputChanged()`.
4. **`getOutputs()`**: Return `{ rating: this.currentRating }`.
5. **`destroy()`**: No-op (React cleanup is handled by the virtual control framework).

### Prompt to generate index.ts
> Write a PCF virtual React control class called `[ComponentName]` that implements `ComponentFramework.ReactControl<IInputs, IOutputs>`. In `init`, save `notifyOutputChanged` and enable container resize tracking. In `updateView`, read the parameters, `allocatedWidth`, and `allocatedHeight` from the context, then return a `React.createElement` of the `[ComponentName]Component` (imported from `./[ComponentName]Component`), passing an `onChange` callback that stores the new rating and calls `notifyOutputChanged`. `getOutputs` returns the current rating.

## Step 6 — Build and test locally
npm run build          # compile once
npm start watch        # launch the PCF test harness in a browser

The test harness lets you set parameters, and resize the container to verify responsive behavior.

## Step 7 — Deploy to Power Apps

### Push directly to a dev environment
pac pcf push --publisher-prefix [prefix]