# GridStudy

This app uses commons-ui library which released in the npmjs packages.

To launch the app type `npm install` then `npm start` .

##### Development Scripts

- **`npm run type-check`** - Runs TypeScript type checking without emitting files. This ensures all developers use the project's local TypeScript version from `node_modules` rather than a potentially different globally-installed version. Run this to verify your code has no type errors before committing.

- **`npm run build`** - Builds the library. Note: This automatically runs `npm run prebuild` first.

- **`npm run prebuild`** - Runs linting and type checking before the build. This script is executed automatically by npm before `npm run build` and ensures that the build is not executed if linting or type checking fails. You don't need to call this manually unless you want to verify code quality without building.

If you are a developer and you want to update / enhance components used from the gridsuite commons-ui library
click [here](https://github.com/gridsuite/commons-ui) and follow instructions.

[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

## Typescript config

Files tsconfig.json and src/react-app-env.d.ts both results from create-react-app typescript template (version 5).
Some property values have been changed to meet the project needs (ex: target, baseUrl,...).

#### License Headers and dependencies checking

To check dependencies license compatibility with this project one locally, please run the following command :

```
npm run licenses-check
```

Notes :

- Check [license-checker-config.json](license-checker-config.json) for license white list and exclusion.
  If you need to update this list, please inform organization's owners.
- We need to exclude some packages for now :
    - `@mapbox/jsonlint-lines-primitives@2.0.2` is a special license
    - `cartocolor@4.0.2` is Creative Commons but not correctly described in the package
    - `rw@0.1.4` is a BSD but not correctly described in the package ("BSD*")
