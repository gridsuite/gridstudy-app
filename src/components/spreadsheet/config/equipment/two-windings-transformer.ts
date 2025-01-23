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
import { getComputedRegulationMode } from '../../../dialogs/network-modifications/two-windings-transformer/tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import {
    booleanCellEditorConfig,
    enumCellEditorConfig,
    type ICustomCellEditorParams,
    numericalCellEditorConfig,
    standardSelectCellEditorConfig,
} from '../common/cell-editors';
import { convertInputValue, FieldType } from '@gridsuite/commons-ui';

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
            colId: 'ID',
            field: 'id',
            ...defaultTextFilterConfig,
            context: {
                ...defaultTextFilterConfig.context,
                isDefaultSort: true,
            },
        },
        {
            colId: 'Name',
            field: 'name',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            ...defaultTextFilterConfig,
        },
        {
            colId: 'Country',
            field: 'country',
            ...countryEnumFilterConfig,
            cellRenderer: CountryCellRenderer,
        },
        {
            colId: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
        },
        {
            colId: 'ratedVoltage1KV',
            field: 'ratedU1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.ratedU1),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ratedVoltage2KV',
            field: 'ratedU2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
            },
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.ratedU2),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ActivePowerSide1',
            field: 'p1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ActivePowerSide2',
            field: 'p2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ReactivePowerSide1',
            field: 'q1',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ReactivePowerSide2',
            field: 'q2',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
                canBeInvalidated: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'HasLoadTapChangingCapabilities',
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
            colId: 'RatioRegulationMode',
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
            getQuickFilterText: excludeFromGlobalFilter,
            editable: isTwtRatioOnloadAndEditable,
            cellStyle: editableCellStyle,
            ...getDefaultEnumConfig(Object.values(RATIO_REGULATION_MODES)),
            context: {
                ...getDefaultEnumConfig(Object.values(RATIO_REGULATION_MODES)).context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'ratioTapChanger.hasLoadTapChangingCapabilities',
                        columnValue: true,
                    },
                },
            },
        },
        {
            colId: 'TargetVPoint',
            field: 'ratioTapChanger.targetV',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 1,
            },
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
            colId: 'RatioDeadBand',
            field: 'ratioTapChanger.targetDeadband',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 1,
            },
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
            colId: 'RatioRegulationTypeText',
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
            editable: isTwtRatioOnloadAndEditable,
            cellStyle: editableCellStyle,
            getQuickFilterText: excludeFromGlobalFilter,
            ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)),
            context: {
                ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)).context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
        },
        {
            colId: 'RatioRegulatedSide',
            field: 'ratioTapChanger.regulationSide',
            ...getDefaultEnumConfig(Object.values(SIDE)),
            context: {
                ...getDefaultEnumConfig(Object.values(SIDE)).context,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'ratioTapChanger.regulationType',
                        columnValue: REGULATION_TYPES.LOCAL.id,
                    },
                },
            },
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
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RatioRegulatingTerminal',
            field: 'ratioTapChanger.ratioRegulatingTerminal',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.ratioTapChanger?.ratioRegulatingTerminal,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'ratioTapChanger.regulationType',
                        columnValue: REGULATION_TYPES.DISTANT.id,
                    },
                },
            },
            getQuickFilterText: excludeFromGlobalFilter,
            cellStyle: (params) => (isEditableTwtRatioRegulatingTerminalCell(params) ? editableCellStyle(params) : {}),
            editable: isEditableTwtRatioRegulatingTerminalCell,
            ...TWTRegulatingTerminalCellEditorConfig,
        },
        {
            colId: 'RatioLowTapPosition',
            field: 'ratioTapChanger.lowTapPosition',
            getQuickFilterText: excludeFromGlobalFilter,
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'ratioTapChanger.steps',
                    },
                },
            },
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
        },
        {
            colId: 'RatioHighTapPosition',
            field: 'ratioTapChanger.highTapPosition',
            ...defaultNumericFilterConfig,
            valueGetter: (params) => computeHighTapPosition(params?.data?.ratioTapChanger?.steps),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'RatioTap',
            field: 'ratioTapChanger.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'ratioTapChanger.steps',
                    },
                },
            },
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
        },
        {
            colId: 'RegulatingMode',
            field: 'phaseTapChanger.regulationMode',
            ...getDefaultEnumConfig(Object.values(PHASE_REGULATION_MODES)),
            context: {
                ...getDefaultEnumConfig(Object.values(PHASE_REGULATION_MODES)).context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            valueGetter: (params) => params?.data?.phaseTapChanger?.regulationMode,
            valueSetter: (params) => {
                params.data.phaseTapChanger = {
                    ...(params.data?.phaseTapChanger || {}),
                    regulationMode: params.newValue,
                };
                return true;
            },
            getQuickFilterText: excludeFromGlobalFilter,
            editable: hasTwtPhaseTapChangerAndEditable,
            cellStyle: editableCellStyle,
            ...enumCellEditorConfig(
                (params) => params.data?.phaseTapChanger?.regulationMode,
                Object.values(PHASE_REGULATION_MODES)
            ),
        },
        {
            colId: 'RegulatingValue',
            field: 'phaseTapChanger.regulationValue',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                fractionDigits: 1,
            },
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
            colId: 'PhaseDeadBand',
            field: 'phaseTapChanger.targetDeadband',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                fractionDigits: 1,
            },
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
            colId: 'PhaseRegulationTypeText',
            field: 'phaseTapChanger.regulationType',
            ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)),
            context: {
                ...getDefaultEnumConfig(Object.values(REGULATION_TYPES)).context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
            },
            valueGetter: (params) => params.data?.phaseTapChanger?.regulationType,
            valueSetter: (params) => {
                params.data.phaseTapChanger = {
                    ...(params.data?.phaseTapChanger || {}),
                    regulationType: params.newValue,
                };
                return true;
            },
            editable: hasTwtPhaseTapChangerAndEditable,
            cellStyle: editableCellStyle,
            ...enumCellEditorConfig(
                (params) => params.data?.phaseTapChanger?.regulationType,
                Object.values(REGULATION_TYPES)
            ),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'PhaseRegulatedSide',
            field: 'phaseTapChanger.regulationSide',
            ...getDefaultEnumConfig(Object.values(SIDE)),
            context: {
                ...getDefaultEnumConfig(Object.values(SIDE)).context,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'phaseTapChanger.regulationType',
                        columnValue: REGULATION_TYPES.LOCAL.id,
                    },
                },
            },
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
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'PhaseRegulatingTerminal',
            field: 'phaseTapChanger.phaseRegulatingTerminal',
            ...defaultTextFilterConfig,
            valueGetter: (params) => params.data?.phaseTapChanger?.phaseRegulatingTerminal,
            context: {
                ...defaultTextFilterConfig.context,
                columnWidth: MEDIUM_COLUMN_WIDTH,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'phaseTapChanger.regulationType',
                        columnValue: REGULATION_TYPES.DISTANT.id,
                    },
                },
            },
            getQuickFilterText: excludeFromGlobalFilter,
            cellStyle: (params) => (isEditableTwtPhaseRegulatingTerminalCell(params) ? editableCellStyle(params) : {}),
            editable: isEditableTwtPhaseRegulatingTerminalCell,
            ...TWTRegulatingTerminalCellEditorConfig,
        },
        {
            colId: 'PhaseLowTapPosition',
            field: 'phaseTapChanger.lowTapPosition',
            getQuickFilterText: excludeFromGlobalFilter,
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'phaseTapChanger.steps',
                    },
                },
            },
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
        },
        {
            colId: 'PhaseHighTapPosition',
            field: 'phaseTapChanger.highTapPosition',
            ...defaultNumericFilterConfig,
            valueGetter: (params) => computeHighTapPosition(params?.data?.phaseTapChanger?.steps),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'PhaseTap',
            field: 'phaseTapChanger.tapPosition',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 0,
                crossValidation: {
                    requiredOn: {
                        dependencyColumn: 'phaseTapChanger.steps',
                    },
                },
            },
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
        },
        {
            colId: 'r',
            field: 'r',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'x',
            field: 'x',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'g',
            field: 'g',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            valueGetter: (params) => convertInputValue(FieldType.G, params.data.g),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'b',
            field: 'b',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            valueGetter: (params) => convertInputValue(FieldType.B, params.data.b),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'ratedNominalPower',
            field: 'ratedS',
            ...defaultNumericFilterConfig,
            context: {
                ...defaultNumericFilterConfig.context,
                numeric: true,
                fractionDigits: 1,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'connected1',
            field: 'terminal1Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            colId: 'connected2',
            field: 'terminal2Connected',
            cellRenderer: BooleanCellRenderer,
            ...defaultBooleanFilterConfig,
            context: {
                ...defaultBooleanFilterConfig.context,
                boolean: true,
            },
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
