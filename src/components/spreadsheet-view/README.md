 

## Overview

The spreadsheet view is the equipment data explorer of GridStudy. It displays network equipment (substations, lines, generators, etc.) in tabular form with per-row formula evaluation, multi-node comparison via node aliases, column-level and global filtering, and aggregation rows (SUM, AVG, MIN, MAX). Its configuration — tabs, columns, filters, sort, node aliases — is persisted to the backend and restored on reload.

-----

## Architecture

### Component Tree

```
 SpreadsheetView (spreadsheet-view.tsx)
├── SpreadsheetTabs (spreadsheet-tabs/)        — tab bar, add/remove/rename/reorder
│   └── SpreadsheetTabsToolbar                 — save collection, model editor, reset
└── Spreadsheet (spreadsheet/)                 — one instance per tab (lazy-loaded)
    ├── SpreadsheetToolbar (spreadsheet-toolbar/)
    │   ├── ColumnsConfig                      — column visibility / locking panel
    │   ├── NodesConfigButton                  — node alias management
    │   ├── SpreadsheetGlobalFilter            — equipment filter selector
    │   ├── RowCounter                         — filtered row counter
    │   ├── SaveSpreadsheetButton              — export model / collection
    │   └── ColumnCreationButton               — add custom column
    └── SpreadsheetContent (spreadsheet-content/)
        └── EquipmentTable                     — AG Grid with custom columns, filters, pinned rows
```

### Data Flow

```
Backend REST API
       │
       ▼
useSpreadsheetEquipments          ← watches: tree nodes, node aliases, optional loading params
       │
       ▼
useFetchEquipment                 — batches fetchNetworkElementsInfos() calls per node
       │
       ▼
Redux: spreadsheetNetwork
  .equipments[type]
  .equipmentsByNodeId[nodeId]     — raw data keyed by node UUID
       │
       ▼
SpreadsheetContent
  transformedRowData              — merges all nodes, prefixes fields by alias
       │
       ▼
EquipmentTable (AG Grid)
  columnMapper                    — per-row formula evaluation via MathJS
  isExternalFilterPresent /
  doesFormulaFilteringPass        — global filter applied as AG Grid external filter
       │
       ▼
Pinned rows (calculation-utils)   — aggregation rows appended below data
```

-----

## Spreadsheet Tabs & Collections

### Tab Definition

Each tab is a `SpreadsheetTabDefinition`:

```
interface SpreadsheetTabDefinition {
    uuid: UUID;
    type: SpreadsheetEquipmentType;   // determines which equipment type is loaded
    name: string;                      // display label
    columns: ColumnDefinition[];
    index: number;                     // display order
}
```

The full set of tabs is a **collection** identified by `state.tables.uuid`. Collections can be saved, loaded from a named model, or reset to the user's default.

### Redux state

| Path                         | Content                              |
| ---------------------------- | ------------------------------------ |
| `state.tables.definitions`   | Ordered array of all tab definitions |
| `state.tables.activeTabUuid` | UUID of the currently visible tab    |
| `state.tables.uuid`          | UUID of the current collection       |

### Lifecycle

1.  `SpreadsheetView` fetches the collection from the
    backend (`getSpreadsheetConfigCollection`) on mount and dispatches `initTableDefinitions`.
2.  Switching tabs dispatches `setActiveSpreadsheetTab`.
3.  All structural changes (add, remove, rename, reorder) are persisted
    to the backend **and** mirrored to Redux. There is no optimistic update: the Redux action is dispatched after a successful API call.

### Adding tabs

Three creation modes are accessible from `AddSpreadsheetButton`:

| Mode              | Entry point                                   | Result                                                     |
| ----------------- | --------------------------------------------- | ---------------------------------------------------------- |
| Empty spreadsheet | `add-empty-spreadsheet-dialog.tsx`            | New tab with only an `id` column |
| From model        | `add-spreadsheet-from-model-dialog.tsx`       | New tab pre-populated with a saved column model            |
| From collection   | `add-spreadsheets-from-collection-dialog.tsx` | Multiple tabs imported from a saved collection template    |

All three modes converge on `addNewSpreadsheet()` in `add-spreadsheet-utils.ts`, which creates the backend record and dispatches Redux actions for definition, sort, and filter initialisation.

-----

## Column System

### ColumnDefinition

```
interface ColumnDefinition {
    uuid: UUID;
    id: string;             // stable programming key used in formula dependencies
    name: string;           // header label
    type: COLUMN_TYPES;     // TEXT | NUMBER | BOOLEAN | ENUM
    precision?: number;     // decimal places for NUMBER columns
    formula: string;        // MathJS expression, receives row fields as variables
    dependencies?: string[]; // column IDs referenced in formula
    visible: boolean;
    locked?: boolean;       // pinned to left when true
}
```

### Formula Evaluation

Formulas are evaluated at render time in `columnMapper.ts` via a sandboxed MathJS instance (`columns/utils/math.ts`). For each row, the equipment object's properties are injected as top-level variables, and the formula is evaluated.

```
formula: "p * 1000"  →  for row { id: "G1", p: 100 }  →  100000
```

**Built-in custom functions**:

| Function              | Description                 |
| --------------------- | --------------------------- |
| `unitToKiloUnit(x)`   | Divides by 1000             |
| `unitToMicroUnit(x)`  | Multiplies by 1 000 000     |
| `match(val, pattern)` | Regex test, returns boolean |
| `length(x)`           | Array length                |

**Security restrictions**: `import`, `createUnit`, `evaluate`, `parse`, `compile`, `simplify`, `derivative`, `rationalize` are removed from the MathJS scope to prevent arbitrary code execution.

**Validation**: After evaluation, `formula-validator.ts` checks that the returned value matches the declared column type. A `ValidationError` is displayed in the cell if the type does not match.

**Cyclic dependencies**: `cyclic-dependencies.ts` performs a DFS to detect cycles before saving a column. A column that references itself (directly or through a chain) is rejected.

### Mapping to AG Grid ColDef

`columnMapper.ts` converts a `ColumnDefinition` to an AG Grid `ColDef`:

  - `valueGetter`: evaluates the formula for data rows; returns raw
    stored value for pinned calculation rows.
  - `cellRenderer` / `cellStyle`: driven
    by `COLUMN_TYPES`.
  - `headerComponent`: `CustomHeaderComponent` with
    custom sort/filter UI and a `ColumnMenu` (update, delete, duplicate).
  - Filter
    component: `CustomAggridComparatorFilter`, `CustomAggridBooleanFilter`, or `CustomAggridAutocompleteFilter` depending on type.

### Column persistence

Column visibility, locking, order, and per-column filter state are persisted to the backend via `study-config` service calls. Sort configuration is persisted separately via `updateSpreadsheetSort()`.

-----

## Equipment Data Loading

### What triggers a fetch

`useSpreadsheetEquipments` (called from `StudyPane`) watches:

  - `state.tables.definitions` (tab list changed)
  - `nodeAliases` (aliased nodes added/removed)
  - `currentTreeNode` (navigation)
  - `spreadsheetOptionalLoadingParameters` (optional data
    groups toggled)

It computes the set of node IDs that need data (`nodesIdsToFetch = builtNodes − alreadyLoadedNodes`) and calls `useFetchEquipment` for each type × node combination.

### Incremental real-time updates

`useUpdateEquipmentsOnNotification` subscribes to study WebSocket notifications. On each notification it:

1.  Identifies which equipment types are affected
    (`impactedSubstationsEquipmentTypes`).
2.  Refetches only the affected types for only the relevant nodes.
3.  Handles deletions by removing the equipment from Redux.

On root network switch, `useResetSpreadsheetOnRootNetwork` clears all cached equipment.

### Optional loading parameters

Some columns require extra data (operational limits groups, regulating terminals, network components). `useOptionalLoadingParametersForEquipments` tracks which groups are needed per equipment type and triggers a re-fetch when they change.

-----

## Node Aliases

### Purpose

Node aliases allow displaying side-by-side data from **multiple nodes** of the modification tree in the same spreadsheet. This is used for scenario comparison: for example, comparing the current node's results against a reference node.

### Data model

```
type NodeAlias = {
    id?: UUID;      // UUID of the tree node being aliased
    name?: string;  // display name of the tree node
    alias: string;  // prefix applied to all columns for this node
};
```

### Workflow

1.  The user opens **Nodes Config** in the
    toolbar (`nodes-config-dialog.tsx`).
2.  They pick tree nodes and assign an alias string
    (e.g. `"base"`, `"scenario1"`).
3.  `updateNodeAliases()` persists the aliases to the
    backend and dispatches to Redux.
4.  `useSpreadsheetEquipments` detects the change and
    fetches equipment for all aliased nodes.
5.  `SpreadsheetContent.transformedRowData` merges all node
    datasets and prefixes each field with the alias: a row gets fields `base.p`, `base.q`, `scenario1.p`, `scenario1.q`, etc. alongside the current node's fields.
6.  Column formulas can reference aliased fields using the dot notation.

### Real-time consistency

`useNodeAliasesUpdateOnNotification` listens for node-edit and node-delete notifications. If an aliased node is modified or deleted, the alias list is refetched from the backend.

-----

## Global Filters Integration

Global filters are equipment-level filters from the filter library (e.g., "substations in France"). They are applied **after** AG Grid's own column filters via the external filter mechanism.

### Flow

1.  `SpreadsheetGlobalFilter` renders
    a `GlobalFilterSelector`, scoped to the current tab's `tableUuid` and `TableType.Spreadsheet`.
2.  The selected filters are stored in Redux
    at `state.tableGlobalFilters[tableUuid]`.
3.  `useSpreadsheetGsFilter` retrieves the active filter
    set and calls `useGlobalFilterResults` to obtain the set of equipment IDs that pass the filter.
4.  AG Grid callbacks:
      - `isExternalFilterPresent()`:
        returns `true` when any filter is active.
      - `doesExternalFilterPass(node)`:
        returns `true` if `node.data.id` is in the filtered set and if our custom filtering is not pending.
5.  When filters change, the hook
    calls `gridApi.onFilterChanged()` to trigger a re-filter pass.

-----

## Calculation Rows

Aggregation rows are pinned to the bottom of the grid. Supported operations: **SUM**, **AVERAGE**, **MIN**, **MAX**.

### Generation

`useGridCalculations` (in `spreadsheet-content/hooks/`) reads `state.calculationSelections[tabUuid]` (the set of active operations for this tab) and, whenever the row data changes, calls `generateCalculationRows()` from `utils/calculation-utils.ts`.

`generateCalculationRows` produces:

  - One row per active operation (type `CALCULATION_ROW`),
    with pre-computed aggregated values per column.
  - One footer row (type `CALCULATION_BUTTON`) that renders
    the add/remove calculation buttons.

`extractNumericValuesForColumns` does a single pass over all rows to collect values for all numeric columns at once, then `calculateValue` aggregates each.

The `columnMapper` `valueGetter` detects calculation rows by checking `node.rowPinned === 'bottom'` and returns the pre-computed value directly, bypassing formula evaluation.

-----

## AG Grid Configuration

**Grid component**: `CustomAGGrid` from `@gridsuite/commons-ui`.

**Key configuration choices**:

| Setting                   | Value                                     | Reason                                            |
| ------------------------- | ----------------------------------------- | ------------------------------------------------- |
| `getRowId`                | `equipment.id` for data rows | stable identity for incremental updates           |
| Row selection             | single, no checkboxes                     | opens modification dialog on click                |
| `suppressAggFuncInHeader` | `true`                                    | aggregation displayed in pinned rows, not headers |
| `animateRows`             | `false`                                   | performance with large datasets                   |
| `theme`                   | `'legacy'` (global option)   | migration from AG Grid v32                        |

**Row styling** (`getRowStyle`):

  - Calculation rows: bold text, gray background.
  - Calculation button row: top border separator, hover highlight.
  - Regular rows: pointer cursor when modification is available.

-----

## Persistence & Backend Interaction

All configuration is stored in the study on the backend. The service layer is in `src/services/study/study-config.ts` and `src/services/study-config.ts`.

| What                | Service call                                             |
| ------------------- | -------------------------------------------------------- |
| Load collection     | `getSpreadsheetConfigCollection(studyUuid)`              |
| Add tab             | `addSpreadsheetConfigToCollection(studyUuid, tabConfig)` |
| Rename tab          | `renameSpreadsheetModel(studyUuid, tabUuid, name)`       |
| Delete tab          | `deleteSpreadsheetModel(studyUuid, tabUuid)`             |
| Reorder tabs        | `reorderTableDefinitions(studyUuid, newOrder)`           |
| Update columns      | `updateSpreadsheetColumns(studyUuid, tabUuid, columns)`  |
| Update sort         | `updateSpreadsheetSort(studyUuid, tabUuid, sortConfig)`  |
| Update node aliases | `updateNodeAliases(studyUuid, aliases)`                  |
| Save as named model | `createSpreadsheetModel(name, tabConfig)`                |
| Save as collection  | `createSpreadsheetCollection(name, allTabsConfig)`       |

-----

## Adding a New Equipment Type

To add a new equipment type to the spreadsheet:

1.  **Add the enum
    value** to `SpreadsheetEquipmentType` in `types/spreadsheet.type.ts`.
2.  **Register the equipment info** in the equipment type
    config map used by `useFetchEquipment` (check `use-fetch-equipment.ts` for the `fetchNetworkElementsInfos` call parameters).
3.  **Map to edit
    dialog** in `use-equipment-modification.tsx` so inline editing works.
4.  **Define global filter
    compatibility** in `spreadsheet-global-filter.tsx` (which filter types are applicable to this equipment type).
5.  **Add optional loading parameters** if the equipment
    type needs extra data groups (see `use-optional-loading-parameters-for-equipments.ts`).

-----

## Adding a Custom Column Function

To add a new built-in function available in column formulas:

1.  Open `columns/utils/math.ts`.
2.  Define the function in
    the `customFunctions` object passed to `math.import()`.
3.  Add it to the `RESTRICTED_FUNCTIONS` list
    if it should not be overridable by user formulas.
4.  Document it in the formula editor help text if applicable.

-----

## Key Files Quick Reference

| File                                                                 | Role                                                            |
| -------------------------------------------------------------------- | --------------------------------------------------------------- |
| `spreadsheet-view.tsx`                                               | Root component; initialises collection from backend             |
| `hooks/use-spreadsheet-equipments.ts`                                | Equipment loading orchestration                                 |
| `hooks/use-fetch-equipment.ts`                                       | API calls for equipment data                                    |
| `hooks/use-node-aliases.ts`                                          | Node alias CRUD                                                 |
| `hooks/use-update-equipments-on-notification.ts`                     | Real-time equipment updates                                     |
| `columns/utils/column-mapper.ts`                                     | `ColumnDefinition` → AG Grid `ColDef` |
| `columns/utils/math.ts`                                              | Sandboxed MathJS instance                                       |
| `columns/utils/formula-validator.ts`                                 | Return type validation                                          |
| `columns/utils/cyclic-dependencies.ts`                               | Cycle detection in column dependencies                          |
| `spreadsheet/spreadsheet-content/equipment-table.tsx`                | AG Grid wrapper                                                 |
| `spreadsheet/spreadsheet-content/hooks/use-spreadsheet-gs-filter.ts` | Global filter ↔ AG Grid bridge                                  |
| `spreadsheet/spreadsheet-content/hooks/use-grid-calculations.ts`     | Aggregation rows                                                |
| `add-spreadsheet/dialogs/add-spreadsheet-utils.ts`                   | Tab creation helpers                                            |
| `utils/calculation-utils.ts`                                         | Aggregation math                                                |
| `types/spreadsheet.type.ts`                                          | Core type definitions                                           |
