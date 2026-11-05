# GridStudy-App

[![MPL-2.0 License](https://img.shields.io/badge/license-MPL_2.0-blue.svg)](https://www.mozilla.org/en-US/MPL/2.0/)

## Description

The **gridstudy-app** is the network study front-end of the [GridSuite](https://github.com/gridsuite) platform. It is the UI consumed by users on top of the [`study-server`](https://github.com/gridsuite/study-server) microservice, and provides:

- **Modification tree**: visualize and navigate the network modification tree, including node menus, layout and root-network management.
- **Network modifications**: create/edit a wide range of equipment modifications — generators, loads, lines, transformers, substations, voltage levels, shunt compensators, static var compensators, HVDC lines, batteries, coupling devices, tabular and by-filter modifications, scalings, generation dispatch, balances adjustment, voltage init modification, etc.
- **Diagram workspace**: dockable workspace with single-line diagrams (SLD), network-area diagrams (NAD) and the geographical network map, organized as resizable/draggable panels.
- **Computation results**: run and inspect results for load flow, security analysis, sensitivity analysis, short-circuit analysis, voltage initialization, state estimation, dynamic simulation, dynamic security analysis, dynamic margin calculation and PCC-min.
- **Node activity & computing status**: live indicators of running computations and activity per modification node.
- **Reports**: browse detailed, paginated execution logs/reports per node.
- **Spreadsheet view**: Excel-like, multi-tab tabular exploration and bulk editing of network equipment data.
- **Equipment search**: global top-bar search to locate and jump to any network equipment, plus map hover tooltips for branches, generators, loads and voltage levels.
- **Parameters**: dedicated parameter dialogs for computations (state estimation, PCC-min, voltage init) and general study parameters.
- **Navigation**: breadcrumbs for the study path and root-network selection.

This app uses the [commons-ui](https://github.com/gridsuite/commons-ui) library which is released on npmjs.

## Technical Stack

- React + TypeScript, built with Vite
- Redux Toolkit (RTK) for state management
- MUI (Material UI) for the component library
- [@powsybl/network-viewer](https://github.com/powsybl/powsybl-diagram-viewer) for network diagrams (single-line diagrams, network-area diagrams) and the geographical map
- `@xyflow/react` for the network modification tree graph
- ag-grid for tabular data (results tables, spreadsheet view); `@tanstack/react-table` is used in a couple of specific tables
- react-hook-form + yup for forms and validation
- `react-resizable-panels` and `react-rnd` for the dockable/resizable diagram workspace
- `react-grid-layout` for the dynamic simulation timeseries chart layout
- `plotly.js` / `react-plotly.js` for dynamic simulation timeseries charts
- `@hello-pangea/dnd` for drag-and-drop (spreadsheet tabs/columns, dynamic simulation series, draggable tabs)
- `mathjs` for spreadsheet custom-column formula evaluation
- react-intl for i18n
- Jest for unit tests

## Interactions with Other Services

```
┌──────────────────┐
│  gridstudy-app   │──► study-server              (studies, nodes, network modifications, network
│                  │                                data/map, load flow, sensitivity analysis,
│                  │                                short-circuit, voltage init, state estimation,
│                  │                                dynamic simulation/security/margin, directory lookup)
│                  │──► study-config-server        (spreadsheet config collections, workspaces)
│                  │──► explore-server              (parameters, composite modifications,
│                  │                                 spreadsheet configs, diagram config)
│                  │
│                  │◄── study-notification (websocket)                         (study/node/computation updates, quota)
│                  │◄── config-notification (websocket, via commons-ui)        (user config changes)
│                  │◄── config-notification/global (websocket, via commons-ui) (system-wide announcements)
│                  │◄── directory-notification (websocket)                     (directory/study deletion)
└──────────────────┘
```

## Getting started

To launch the app type `npm install` then `npm start`.

##### Development Scripts

- **`npm run type-check`** - Runs TypeScript type checking without emitting files. This ensures all developers use the project's local TypeScript version from `node_modules` rather than a potentially different globally-installed version. Run this to verify your code has no type errors before committing.

- **`npm run build`** - Builds the app. Note: This automatically runs `npm run prebuild` first.

- **`npm run prebuild`** - Runs linting and type checking before the build. This script is executed automatically by npm before `npm run build` and ensures that the build is not executed if linting or type checking fails. You don't need to call this manually unless you want to verify code quality without building.

## Front-End Architecture

The code under `src` is organised as follows:

- **`components/`** - UI building blocks
- **`redux/`** - Global application state managed with [`redux-toolkit`](https://redux-toolkit.js.org/) (RTK): `slices`, `selectors`, `session-storage` persistence and the root reducer/store shared across the app.
- **`services/`** - All backend REST and WebSocket calls, split by domain.
- **`hooks/`** - Reusable React hooks.
- **`plugins/`** - Extension points, including `translations` for plugin-provided i18n messages.
- **`translations/`** - i18n message files (`react-intl`).
- **`styles/`** - Light/dark theme CSS variables.
- **`utils/`** - Generic, reusable helper functions.
- **`constants/`** - Shared constants.
- **`types/`** - Shared TypeScript types.
- **`images/`** - Static assets (logos, icons).
- **`_mocks_/`** - Mocks used by unit tests.

If you are a developer and you want to update/enhance components used from the gridsuite commons-ui library,
click [here](https://github.com/gridsuite/commons-ui) and follow instructions.

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Typescript config

The project TypeScript settings are defined in `tsconfig.json`. Some compiler options are customized for project needs, such as `target` and `baseUrl`.

## License Headers and dependencies checking

To check dependencies license compatibility with this project locally, please run the following command:

```
npm run licenses-check
```

Notes:

- Check [license-checker-config.json](license-checker-config.json) for the license white list.
  If you need to update this list, please inform the organization's owners.

## Useful technical information

- [Spreadsheet view](src/components/spreadsheet-view/README.md)
- [Network illustrations](src/components/dialogs/README.md)
