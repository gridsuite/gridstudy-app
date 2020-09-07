# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.0] - 2020-05-18

### Added

-   Changing switch positions from the single line diagrams
-   Dynamic or static arrows on the lines to show the current direction
-   Button to execute a load flow on the opened network

### Changed

-   Reduction of the substation radius on the map

### Fixed

-   Browser support for EDGE 44 and Firefox 68 ESR

## [0.3.0] - 2020-05-04

### Added

-   Enable a fullscreen mode [[feature demo]](https://gridsuite.github.io/demo/v0.3.0/fullscreen.gif)
-   Renaming option in the study's menu [[feature demo]](https://gridsuite.github.io/demo/v0.3.0/rename.gif)

### Changed

-   Make the parameter window modal [[feature demo]](https://gridsuite.github.io/demo/v0.3.0/settings-window.gif)
-   New way to display transformers on substation images [[feature demo]](https://gridsuite.github.io/demo/v0.3.0/transformers.gif)

### Fixed

-   Recenter the map on a substation after a moving event [[feature demo]](https://gridsuite.github.io/demo/v0.3.0/fix-center-on-substation.gif)

## [0.2.0] - 2020-04-20

### Added

-   Support of IEEE files [[feature demo]](https://gridsuite.github.io/demo/v0.2.0/ieee14.gif)
-   Creation of a main apps menu [[feature demo]](https://gridsuite.github.io/demo/v0.2.0/apps-menu.gif)
-   Enable Pan/Zoom in a substation window [[feature demo]](https://gridsuite.github.io/demo/v0.2.0/pan-substation-view.gif)
-   Center the map on a substation on user clicks [[feature demo]](https://gridsuite.github.io/demo/v0.2.0/center-map.gif)
-   All/none actions for the voltage levels on the map [[feature demo]](https://gridsuite.github.io/demo/v0.2.0/all-none.gif)

### Changed

-   New fancy study-add button [[feature demo]](https://gridsuite.github.io/demo/v0.2.0/add-button.gif)
-   _undefined_ is no more displayed in the substation list when country info is unavailable [[feature demo]](https://gridsuite.github.io/demo/v0.2.0/country-info.gif)

### Fixed

-   Fix authentication when reloading [[feature demo]](https://gridsuite.github.io/demo/v0.2.0/fix-refresh.gif)

## [0.1.0] - 2020-04-06

### Added

-   This new CHANGELOG file can be used as a communication support for the users concerning our main exposed functionalities
-   Manage authentication from an Azure account
-   Create and visualize studies from UCT, IIDM and CGMES network files
-   Geographical display of the imported networks
-   On-demand display of electrical substations

[unreleased]: https://github.com/gridsuite/gridstudy-app/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/gridsuite/gridstudy-app/releases/tag/v0.4.0
[0.3.0]: https://github.com/gridsuite/gridstudy-app/releases/tag/v0.3.0
[0.2.0]: https://github.com/gridsuite/gridstudy-app/releases/tag/v0.2.0
[0.1.0]: https://github.com/gridsuite/gridstudy-app/releases/tag/v0.1.0
