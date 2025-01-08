/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import type { SpreadsheetTabDefinition } from '../spreadsheet.type';
import type { CustomColDef } from '../../../custom-aggrid/custom-aggrid-header.type';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import { type EquipmentTableDataEditorProps, TWTRegulatingTerminalEditor } from '../../utils/equipment-table-editors';
import CountryCellRenderer from '../../utils/country-cell-render';
import type { EditableCallback } from 'ag-grid-community';
import { BooleanCellRenderer } from '../../utils/cell-renderers';
import {
    countryEnumFilterConfig,
    defaultBooleanFilterConfig,
    defaultNumericFilterConfig,
    defaultTextFilterConfig,
    editableCellStyle,
    editableColumnConfig,
    excludeFromGlobalFilter,
    generateTapPositions,
    getDefaultEnumConfig,
    isEditable,
    typeAndFetchers,
} from './common-config';
import { MEDIUM_COLUMN_WIDTH } from '../../utils/constants';
import { PHASE_REGULATION_MODES, RATIO_REGULATION_MODES, REGULATION_TYPES, SIDE } from '../../../network/constants';
import { computeHighTapPosition, getTapChangerRegulationTerminalValue } from '../../../utils/utils';
import { unitToMicroUnit } from '../../../../utils/unit-converter';
import { getComputedRegulationMode } from '../../../dialogs/network-modifications/two-windings-transformer/tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import {
    booleanCellEditorConfig,
    enumCellEditorConfig,
    type ICustomCellEditorParams,
    numericalCellEditorConfig,
    standardSelectCellEditorConfig,
} from '../common/cell-editors';

function getTwtRatioRegulationModeId(twt: any) {
    //regulationMode is set by the user (in edit mode)
    if (twt?.ratioTapChanger?.regulationMode !== undefined) {
        return twt.ratioTapChanger.regulationMode;
    }
    // if onLoadTapChangingCapabilities is set to false or undefined, we set the regulation mode to null
    if (!twt?.ratioTapChanger?.hasLoadTapChangingCapabilities) {
        return null;
    }
    //otherwise, we compute it
    const computedRegulationMode = getComputedRegulationMode(twt);
    return computedRegulationMode?.id || null;
}

const hasTwtRatioTapChanger: EditableCallback = (params) => {
    const ratioTapChanger = params.data?.ratioTapChanger;
    return ratioTapChanger !== null && ratioTapChanger !== undefined && Object.keys(ratioTapChanger).length > 0;
};

const isTwtRatioOnload: EditableCallback = (params) => {
    const hasLoadTapChangingCapabilities = params.data?.ratioTapChanger?.hasLoadTapChangingCapabilities;
    return hasLoadTapChangingCapabilities === true || hasLoadTapChangingCapabilities === 1;
};

const isTwtRatioOnloadAndEditable: EditableCallback = (params) => isEditable(params) && isTwtRatioOnload(params);

const hasTwtPhaseTapChanger: EditableCallback = (params) => {
    const phaseTapChanger = params.data?.phaseTapChanger;
    return phaseTapChanger !== null && phaseTapChanger !== undefined && Object.keys(phaseTapChanger).length > 0;
};

const hasTwtPhaseTapChangerAndEditable: EditableCallback = (params) =>
    isEditable(params) && hasTwtPhaseTapChanger(params);

const isEditableTwtPhaseRegulationSideCell: EditableCallback = (params) =>
    isEditable(params) && params.data?.phaseTapChanger?.regulationType === REGULATION_TYPES.LOCAL.id;

const isEditableTwtRatioRegulationSideCell: EditableCallback = (params) =>
    isTwtRatioOnloadAndEditable(params) && params.data?.ratioTapChanger?.regulationType === REGULATION_TYPES.LOCAL.id;

const isEditableTwtRatioRegulatingTerminalCell: EditableCallback = (params) =>
    isTwtRatioOnloadAndEditable(params) && params.data?.ratioTapChanger?.regulationType === REGULATION_TYPES.DISTANT.id;

const isEditableTwtPhaseRegulatingTerminalCell: EditableCallback = (params) =>
    isEditable(params) && params.data?.phaseTapChanger?.regulationType === REGULATION_TYPES.DISTANT.id;

const TWTRegulatingTerminalCellEditorConfig = {
    cellEditor: TWTRegulatingTerminalEditor,
    // we generate the props for TWTRegulatingTerminalEditor component
    cellEditorParams: (params: ICustomCellEditorParams<any, string, any>): EquipmentTableDataEditorProps => ({
        // @ts-expect-error TODO: defaultValue does not exist in type EquipmentTableDataEditorProps
        defaultValue: getTapChangerRegulationTerminalValue,
        gridContext: params.context,
        gridApi: params.api,
        colDef: params.colDef,
        rowData: params.data,
    }),
    cellEditorPopup: true,
} as const satisfies Partial<ReadonlyDeep<CustomColDef>>;

export const TWO_WINDINGS_TRANSFORMER_TAB_DEF = {
    index: 3,
    name: 'TwoWindingsTransformers',
    ...typeAndFetchers(EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER),
    columns: [
        {
            id: 'ID',
            field: 'id',
            isDefaultSort: true,
            ...defaultTextFilterConfig,
        },
        {
            id: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
        },
        {
            id: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...defaultTextFilterConfig,
        },
        {
            id: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...defaultTextFilterConfig,
        },
        {
            id: 'Country',
            field: 'country',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            id: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
        },
        {
            id: 'ratedVoltage1KV',
            field: 'ratedU1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.ratedU1),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ratedVoltage2KV',
            field: 'ratedU2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 0,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.ratedU2),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerSide1',
            field: 'p1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerSide2',
            field: 'p2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSide1',
            field: 'q1',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSide2',
            field: 'q2',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'HasLoadTapChangingCapabilities',
            field: 'ratioTapChanger.hasLoadTapChangingCapabilities',
            valueGetter: (params) => params?.data?.ratioTapChanger?.hasLoadTapChangingCapabilities,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            editable: (params) => isEditable(params) && hasTwtRatioTapChanger(params),
            cellStyle: editableCellStyle,
            valueSetter: (params) => {
                params.data.ratioTapChanger = {
                    ...(params.data.ratioTapChanger || {}),
                    hasLoadTapChangingCapabilities: params.newValue,
                    regulationMode: !!params.newValue
                        ? getTwtRatioRegulationModeId(params.data) || RATIO_REGULATION_MODES.FIXED_RATIO.id
                        : null,
                };
                return true;
            },
            ...booleanCellEditorConfig(
                (params) => params.data?.ratioTapChanger?.hasLoadTapChangingCapabilities ?? false
            ),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioRegulationMode',
            field: 'ratioTapChanger.regulationMode',
            valueGetter: (params) => params.data?.ratioTapChanger?.regulationMode,
            valueSetter: (params) => {
                params.data.ratioTapChanger = {
                    ...(params.data?.ratioTapChanger || {}),
                    regulationMode: params.newValue,
                };
                return true;
            },
            ...enumCellEditorConfig(
                (params) => params.data?.ratioTapChanger?.regulationMode,
                Object.values(RATIO_REGULATION_MODES)
            ),
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
            editable: isTwtRatioOnloadAndEditable,
            cellStyle: editableCellStyle,
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'ratioTapChanger.hasLoadTapChangingCapabilities',
                    columnValue: true,
                },
            },
            ...getDefaultEnumConfig(Object.values(RATIO_REGULATION_MODES)),
        },
        {
            id: 'TargetVPoint',
            field: 'ratioTapChanger.targetV',
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            editable: isTwtRatioOnloadAndEditable,
            cellStyle: editableCellStyle,
            ...numericalCellEditorConfig((params) => params.data?.ratioTapChanger?.targetV),
            valueSetter: (params) => {
                params.data.ratioTapChanger = {
                    ...(params.data?.ratioTapChanger || {}),
                    targetV: params.newValue,
                };
                return true;
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioDeadBand',
            field: 'ratioTapChanger.targetDeadband',
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            editable: isTwtRatioOnloadAndEditable,
            cellStyle: editableCellStyle,
            ...numericalCellEditorConfig((params) => params.data.ratioTapChanger.targetDeadband),
            valueSetter: (params) => {
                params.data.ratioTapChanger = {
                    ...(params.data?.ratioTapChanger || {}),
                    targetDeadband: params.newValue,
                };
                return true;
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioRegulationTypeText',
            field: 'ratioTapChanger.regulationType',
            valueGetter: (params) => params.data?.ratioTapChanger?.regulationType,
            valueSetter: (params) => {
                params.data.ratioTapChanger = {
                    ...(params.data?.ratioTapChanger || {}),
                    regulationType: params.newValue,
                };
                return true;
            },
            ...enumCellEditorConfig(
                (params) => params.data?.ratioTapChanger?.regulationType,
                Object.values(REGULATION_TYPES)
            ),
            columnWidth: MEDIUM_COLUMN_WIDTH,
            editable: isTwtRatioOnloadAndEditable,
            cellStyle: editableCellStyle,
            getQuickFilterText: excludeFromGlobalFilter,
            ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)),
        },
        {
            id: 'RatioRegulatedSide',
            field: 'ratioTapChanger.regulationSide',
            ...getDefaultEnumConfig(Object.values(SIDE)),
            valueGetter: (params) => params.data?.ratioTapChanger?.regulationSide,
            valueSetter: (params) => {
                params.data.ratioTapChanger = {
                    ...(params.data?.ratioTapChanger || {}),
                    regulationSide: params.newValue,
                };
                return true;
            },
            editable: isEditableTwtRatioRegulationSideCell,
            cellStyle: editableCellStyle,
            ...enumCellEditorConfig((params) => params.data?.ratioTapChanger?.regulationSide, Object.values(SIDE)),
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'ratioTapChanger.regulationType',
                    columnValue: REGULATION_TYPES.LOCAL.id,
                },
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioRegulatingTerminal',
            field: 'ratioTapChanger.ratioRegulatingTerminal',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.ratioTapChanger?.ratioRegulatingTerminal,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
            cellStyle: (params) => (isEditableTwtRatioRegulatingTerminalCell(params) ? editableCellStyle(params) : {}),
            editable: isEditableTwtRatioRegulatingTerminalCell,
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'ratioTapChanger.regulationType',
                    columnValue: REGULATION_TYPES.DISTANT.id,
                },
            },
            ...TWTRegulatingTerminalCellEditorConfig,
        },
        {
            id: 'RatioLowTapPosition',
            field: 'ratioTapChanger.lowTapPosition',
            getQuickFilterText: excludeFromGlobalFilter,
            ...defaultNumericFilterConfig,
            numeric: true,
            fractionDigits: 0,
            editable: (params) => isEditable(params) && params.data?.ratioTapChanger?.steps?.length > 0,
            cellStyle: editableCellStyle,
            ...standardSelectCellEditorConfig((params) => generateTapPositions(params.data?.ratioTapChanger)),
            valueSetter: (params) => {
                params.data.ratioTapChanger = {
                    ...(params.data?.ratioTapChanger || {}),
                    lowTapPosition: params.newValue,
                };
                return true;
            },
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'ratioTapChanger.steps',
                },
            },
        },
        {
            id: 'RatioHighTapPosition',
            field: 'ratioTapChanger.highTapPosition',
            ...defaultNumericFilterConfig,
            valueGetter: (params) => computeHighTapPosition(params?.data?.ratioTapChanger?.steps),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioTap',
            field: 'ratioTapChanger.tapPosition',
            ...defaultNumericFilterConfig,
            numeric: true,
            fractionDigits: 0,
            valueGetter: (params) => params?.data?.ratioTapChanger?.tapPosition,
            valueSetter: (params) => {
                params.data.ratioTapChanger = {
                    ...params.data.ratioTapChanger,
                    tapPosition: params.newValue,
                };

                return true;
            },
            ...standardSelectCellEditorConfig((params) => generateTapPositions(params.data?.ratioTapChanger)),
            editable: (params) => isEditable(params) && params.data?.ratioTapChanger?.steps?.length > 0,
            cellStyle: editableCellStyle,
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'ratioTapChanger.steps',
                },
            },
        },
        {
            id: 'RegulatingMode',
            field: 'phaseTapChanger.regulationMode',
            ...getDefaultEnumConfig(Object.values(PHASE_REGULATION_MODES)),
            valueGetter: (params) => params?.data?.phaseTapChanger?.regulationMode,
            valueSetter: (params) => {
                params.data.phaseTapChanger = {
                    ...(params.data?.phaseTapChanger || {}),
                    regulationMode: params.newValue,
                };
                return true;
            },
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
            editable: hasTwtPhaseTapChangerAndEditable,
            cellStyle: editableCellStyle,
            ...enumCellEditorConfig(
                (params) => params.data?.phaseTapChanger?.regulationMode,
                Object.values(PHASE_REGULATION_MODES)
            ),
        },
        {
            id: 'RegulatingValue',
            field: 'phaseTapChanger.regulationValue',
            ...defaultNumericFilterConfig,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            fractionDigits: 1,
            valueGetter: (params) => params?.data?.phaseTapChanger?.regulationValue,
            getQuickFilterText: excludeFromGlobalFilter,
            editable: (params) =>
                hasTwtPhaseTapChangerAndEditable(params) &&
                params.data?.phaseTapChanger?.regulationMode !== PHASE_REGULATION_MODES.FIXED_TAP.id,
            cellStyle: editableCellStyle,
            ...numericalCellEditorConfig((params) => params.data?.phaseTapChanger?.regulationValue),
            valueSetter: (params) => {
                params.data.phaseTapChanger = {
                    ...(params.data?.phaseTapChanger || {}),
                    regulationValue: params.newValue,
                };
                return true;
            },
        },
        {
            id: 'PhaseDeadBand',
            field: 'phaseTapChanger.targetDeadband',
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
            editable: (params) =>
                hasTwtPhaseTapChangerAndEditable(params) &&
                params.data?.phaseTapChanger?.regulationMode !== PHASE_REGULATION_MODES.FIXED_TAP.id,
            cellStyle: editableCellStyle,
            ...numericalCellEditorConfig((params) => params.data?.phaseTapChanger?.targetDeadband),
            valueSetter: (params) => {
                params.data.phaseTapChanger = {
                    ...(params.data?.phaseTapChanger || {}),
                    targetDeadband: params.newValue,
                };
                return true;
            },
        },
        {
            id: 'PhaseRegulationTypeText',
            field: 'phaseTapChanger.regulationType',
            ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)),
            valueGetter: (params) => params.data?.phaseTapChanger?.regulationType,
            valueSetter: (params) => {
                params.data.phaseTapChanger = {
                    ...(params.data?.phaseTapChanger || {}),
                    regulationType: params.newValue,
                };
                return true;
            },
            columnWidth: MEDIUM_COLUMN_WIDTH,
            editable: hasTwtPhaseTapChangerAndEditable,
            cellStyle: editableCellStyle,
            ...enumCellEditorConfig(
                (params) => params.data?.phaseTapChanger?.regulationType,
                Object.values(REGULATION_TYPES)
            ),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PhaseRegulatedSide',
            field: 'phaseTapChanger.regulationSide',
            ...getDefaultEnumConfig(Object.values(SIDE)),
            valueGetter: (params) => params.data?.phaseTapChanger?.regulationSide,
            valueSetter: (params) => {
                params.data.phaseTapChanger = {
                    ...(params.data?.phaseTapChanger || {}),
                    regulationSide: params.newValue,
                };
                return true;
            },
            editable: isEditableTwtPhaseRegulationSideCell,
            cellStyle: editableCellStyle,
            ...enumCellEditorConfig((params) => params.data?.phaseTapChanger?.regulationSide, Object.values(SIDE)),
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'phaseTapChanger.regulationType',
                    columnValue: REGULATION_TYPES.LOCAL.id,
                },
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PhaseRegulatingTerminal',
            field: 'phaseTapChanger.phaseRegulatingTerminal',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.phaseTapChanger?.phaseRegulatingTerminal,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            getQuickFilterText: excludeFromGlobalFilter,
            cellStyle: (params) => (isEditableTwtPhaseRegulatingTerminalCell(params) ? editableCellStyle(params) : {}),
            editable: isEditableTwtPhaseRegulatingTerminalCell,
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'phaseTapChanger.regulationType',
                    columnValue: REGULATION_TYPES.DISTANT.id,
                },
            },
            ...TWTRegulatingTerminalCellEditorConfig,
        },
        {
            id: 'PhaseLowTapPosition',
            field: 'phaseTapChanger.lowTapPosition',
            getQuickFilterText: excludeFromGlobalFilter,
            ...defaultNumericFilterConfig,
            numeric: true,
            fractionDigits: 0,
            editable: (params) => isEditable(params) && params.data?.phaseTapChanger?.steps?.length > 0,
            cellStyle: editableCellStyle,
            ...standardSelectCellEditorConfig((params) => generateTapPositions(params.data?.phaseTapChanger)),
            valueSetter: (params) => {
                params.data.phaseTapChanger = {
                    ...(params.data?.phaseTapChanger || {}),
                    lowTapPosition: params.newValue,
                };
                return true;
            },
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'phaseTapChanger.steps',
                },
            },
        },
        {
            id: 'PhaseHighTapPosition',
            field: 'phaseTapChanger.highTapPosition',
            ...defaultNumericFilterConfig,
            valueGetter: (params) => computeHighTapPosition(params?.data?.phaseTapChanger?.steps),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PhaseTap',
            field: 'phaseTapChanger.tapPosition',
            ...defaultNumericFilterConfig,
            numeric: true,
            fractionDigits: 0,
            valueGetter: (params) => params?.data?.phaseTapChanger?.tapPosition,
            valueSetter: (params) => {
                params.data.phaseTapChanger = {
                    ...params.data.phaseTapChanger,
                    tapPosition: params.newValue,
                };
                return true;
            },
            ...standardSelectCellEditorConfig((params) => generateTapPositions(params.data?.phaseTapChanger)),
            editable: (params) => isEditable(params) && params.data?.phaseTapChanger?.steps?.length > 0,
            cellStyle: editableCellStyle,
            getQuickFilterText: excludeFromGlobalFilter,
            crossValidation: {
                requiredOn: {
                    dependencyColumn: 'phaseTapChanger.steps',
                },
            },
        },
        {
            id: 'r',
            field: 'r',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'x',
            field: 'x',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'g',
            field: 'g',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            valueGetter: (params) => unitToMicroUnit(params.data.g),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'b',
            field: 'b',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            valueGetter: (params) => unitToMicroUnit(params.data.b),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ratedNominalPower',
            field: 'ratedS',
            numeric: true,
            ...defaultNumericFilterConfig,
            fractionDigits: 1,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected1',
            field: 'terminal1Connected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected2',
            field: 'terminal2Connected',
            boolean: true,
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
