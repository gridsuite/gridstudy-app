/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { equipments } from '../network/network-equipments';
import NumericCellEditor from './numericCellEditor.js';
import { BooleanCellRender } from './cell-renderers';

/**
 * Used for boolean cell data value to render a checkbox
 * @param {any} rowData data of row
 * @param {any} columnDefinition definition of column
 * @param {any} key key of element
 * @param {any} style style for table cell element
 * @param {any} rowIndex rowIndex of element
 * @returns {JSX.Element} Component template
 */

const generateTapPositions = (params) => {
    console.log(params);
    return Array.from(
        Array(params.highTapPosition - params.lowTapPosition + 1).keys()
    );
};

const nominalVoltage = (network, voltageLevelId) => {
    return network.getVoltageLevel(voltageLevelId)?.nominalVoltage;
};

export const ROW_HEIGHT = 38;
export const HEADER_ROW_HEIGHT = 64;
export const MIN_COLUMN_WIDTH = 180;
export const MEDIUM_COLUMN_WIDTH = 220;
export const LARGE_COLUMN_WIDTH = 340;
export const EDIT_CELL_WIDTH = 65;
export const MAX_LOCKS_PER_TAB = 5;

export const TABLES_DEFINITIONS = {
    SUBSTATIONS: {
        index: 0,
        name: 'Substations',
        resource: equipments.substations,
        columns: [
            {
                field: 'id',
                id: 'ID',
                filter: true,
                editable: true,
            },
            {
                field: 'name',
                id: 'Name',
                filter: true,
                editable: true,
            },
            {
                field: 'countryName',
                id: 'Country',
                filter: true,
                editable: true,
            },
        ],
    },

    VOLTAGE_LEVELS: {
        index: 1,
        name: 'VoltageLevels',
        resource: equipments.voltageLevels,
        getter: (network) => network.getVoltageLevels(),
        columns: [
            {
                id: 'ID',
                field: 'id',
            },
            {
                id: 'Name',
                field: 'name',
            },
            {
                id: 'SubstationId',
                field: 'substationId',
            },
            {
                id: 'NominalV',
                field: 'nominalVoltage',
                numeric: true,
                fractionDigits: 0,
                editable: true,
                cellEditor: NumericCellEditor,
                cellEditorPopup: true,
                comparator: (valueA, valueB, nodeA, nodeB, isDescending) => {
                    if (valueA === valueB) return 0;
                    return valueA > valueB ? 1 : -1;
                },
                sortable: false,
                sort: 'asc',
            },
        ],
    },

    LINES: {
        index: 2,
        name: 'Lines',
        resource: equipments.lines,
        columns: [
            {
                id: 'ID',
                field: 'id',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'Name',
                field: 'name',
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            {
                id: 'VoltageLevelIdSide1',
                field: 'voltageLevelId1',
            },
            {
                id: 'VoltageLevelIdSide2',
                field: 'voltageLevelId2',
            },
            {
                id: 'NominalVoltageSide1',
                field: 'nominalVoltage1',
                valueGetter: (cellData, network) => {
                    cellData.data.nominalVoltage1 = network
                        ? nominalVoltage(network, cellData.data.voltageLevelId1)
                        : undefined;
                    return cellData.data.nominalVoltage1;
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                valueGetter: (cellData, network) => {
                    cellData.data.nominalVoltage2 = network
                        ? nominalVoltage(network, cellData.data.voltageLevelId2)
                        : undefined;
                    return cellData.data.nominalVoltage2;
                },
                numeric: true,
                fractionDigits: 0,
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
        ],
    },

    TWO_WINDINGS_TRANSFORMERS: {
        index: 3,
        name: 'TwoWindingsTransformers',
        resource: equipments.twoWindingsTransformers,
        modifiableEquipmentType: 'twoWindingsTransformer',
        columns: [
            {
                id: 'ID',
                field: 'id',
                filter: true,
            },
            {
                id: 'Name',
                field: 'name',
                filter: true,
            },
            {
                id: 'VoltageLevelIdSide1',
                field: 'voltageLevelId1',
                filter: true,
            },
            {
                id: 'VoltageLevelIdSide2',
                field: 'voltageLevelId2',
                filter: true,
            },
            {
                id: 'NominalVoltageSide1',
                field: 'nominalVoltage1',
                valueGetter: (cellData, network) => {
                    cellData.data.nominalVoltage1 = network
                        ? nominalVoltage(network, cellData.data.voltageLevelId1)
                        : undefined;
                    return cellData.data.nominalVoltage1;
                },
                numeric: true,
                fractionDigits: 0,
                filter: 'agNumberColumnFilter',
                sortable: true,
            },
            {
                id: 'NominalVoltageSide2',
                field: 'nominalVoltage2',
                valueGetter: (cellData, network) => {
                    cellData.data.nominalVoltage2 = network
                        ? nominalVoltage(network, cellData.data.voltageLevelId2)
                        : undefined;
                    return cellData.data.nominalVoltage2;
                },
                numeric: true,
                fractionDigits: 0,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'ActivePowerSide1',
                field: 'p1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'ActivePowerSide2',
                field: 'p2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'ReactivePowerSide1',
                field: 'q1',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'ReactivePowerSide2',
                field: 'q2',
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'LoadTapChangingCapabilities',
                field: 'loadTapChangingCapabilities',
                valueGetter: (cellData) => {
                    return cellData?.data?.ratioTapChanger
                        ?.loadTapChangingCapabilities;
                },
                boolean: true,
                filter: true,
                cellRenderer: BooleanCellRender,
            },
            {
                id: 'RegulatingRatio',
                field: 'regulatingRatio',
                valueGetter: (cellData) => {
                    return cellData?.data?.ratioTapChanger?.regulating;
                },
                boolean: true,
                filter: true,
                cellRenderer: BooleanCellRender,
            },
            {
                id: 'TargetVPoint',
                field: 'ratioTapChanger.targetV',
                numeric: true,
                fractionDigits: 1,
                filter: 'agNumberColumnFilter',
            },
            {
                id: 'RatioTap',
                field: 'ratioTapChanger',
                numeric: true,
                changeCmd: generateTapRequest('Ratio'),
                fractionDigits: 0,
                valueGetter: (cellData) => {
                    return cellData?.data?.ratioTapChanger?.tapPosition;
                },
                valueSetter: (params) => {
                    params.data.ratioTapChanger.tapPosition = params.newValue;
                    return params;
                },
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: params.data.ratioTapChanger
                            ? generateTapPositions(params.data.ratioTapChanger)
                            : undefined,
                    };
                },
                filter: 'agNumberColumnFilter',
                editable: true,
            },
            {
                id: 'RegulatingMode',
                field: 'regulationMode',
                valueGetter: (cellData) => {
                    return cellData?.data?.phaseTapChanger?.regulationMode;
                },
                columnWidth: MEDIUM_COLUMN_WIDTH,
                filter: true,
            },
            {
                id: 'RegulatingPhase',
                field: 'regulatingPhase',
                valueGetter: (cellData) => {
                    return cellData?.data?.phaseTapChanger?.regulating;
                },
                boolean: true,
                filter: true,
                cellRenderer: BooleanCellRender,
            },
            {
                id: 'PhaseTap',
                field: 'phaseTapChanger',
                numeric: true,
                changeCmd: generateTapRequest('Phase'),
                fractionDigits: 0,
                valueGetter: (cellData) => {
                    return cellData?.data?.phaseTapChanger?.tapPosition;
                },
                valueSetter: (params) => {
                    params.data.phaseTapChanger.tapPosition = params.newValue;
                    return params;
                },
                cellEditor: 'agSelectCellEditor',
                cellEditorParams: (params) => {
                    return {
                        values: params.data.phaseTapChanger
                            ? generateTapPositions(params.data.phaseTapChanger)
                            : undefined,
                    };
                },
                filter: 'agNumberColumnFilter',
                editable: true,
            },
            {
                id: 'RegulatingValue',
                field: 'regulationValue',
                numeric: true,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
                valueGetter: (cellData) => {
                    return cellData?.data?.phaseTapChanger?.regulationValue;
                },
                filter: 'agNumberColumnFilter',
            },
        ],
    },
};

export const DISPLAYED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE =
    'displayedColumns.';
export const LOCKED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE = 'lockedColumns.';
export const REORDERED_COLUMNS_PARAMETER_PREFIX_IN_DATABASE =
    'reorderedColumns.';

export const TABLES_COLUMNS_NAMES = Object.values(TABLES_DEFINITIONS)
    .map((table) => table.columns)
    .map((cols) => new Set(cols.map((c) => c.id)));

export const TABLES_COLUMNS_NAMES_JSON = TABLES_COLUMNS_NAMES.map((cols) =>
    JSON.stringify([...cols])
);

export const TABLES_NAMES = Object.values(TABLES_DEFINITIONS).map(
    (table) => table.name
);

export const TABLES_NAMES_INDEXES = new Map(
    Object.values(TABLES_DEFINITIONS).map((table) => [table.name, table.index])
);

export const TABLES_DEFINITION_INDEXES = new Map(
    Object.values(TABLES_DEFINITIONS).map((table) => [table.index, table])
);

function generateTapRequest(type, leg) {
    const getLeg = leg !== undefined ? '.getLeg' + leg + '()' : '';
    return (
        'tap = equipment' +
        getLeg +
        '.get' +
        type +
        'TapChanger()\n' +
        'if (tap.getLowTapPosition() <= {} && {} <= tap.getHighTapPosition() ) { \n' +
        '    tap.setTapPosition({})\n' +
        // to force update of transformer as sub elements changes like tapChanger are not detected
        '    equipment.setFictitious(equipment.isFictitious())\n' +
        '} else {\n' +
        "throw new Exception('incorrect value')\n" +
        ' }\n'
    );
}
