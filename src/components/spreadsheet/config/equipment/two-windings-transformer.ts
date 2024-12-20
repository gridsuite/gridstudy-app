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
import type { EditableCallback } from 'ag-grid-community';
import {
    editableCellStyle,
    editableColumnConfig,
    excludeFromGlobalFilter,
    generateTapPositions,
    isEditable,
    typeAndFetchers,
} from './common-config';
import {
    BOOLEAN_TYPE,
    COUNTRY_TYPE,
    MEDIUM_COLUMN_WIDTH,
    NUMERIC_0_FRACTION_DIGITS_TYPE,
    NUMERIC_1_FRACTION_DIGITS_TYPE,
    NUMERIC_CAN_BE_INVALIDATED_TYPE,
    NUMERIC_HIGH_TAP_POSITION_TYPE,
    NUMERIC_TYPE,
    NUMERIC_UNIT_TO_MICRO_UNIT_TYPE,
    PHASE_REGULATING_MODE_ENUM_TYPE,
    RATIO_REGULATION_MODES_ENUM_TYPE,
    REGULATION_ENUM_TYPE,
    SIDE_ENUM_TYPE,
    TEXT_TYPE,
} from '../../utils/constants';
import { PHASE_REGULATION_MODES, RATIO_REGULATION_MODES, REGULATION_TYPES, SIDE } from '../../../network/constants';
import { getComputedRegulationMode } from '../../../dialogs/network-modifications/two-windings-transformer/tap-changer-pane/ratio-tap-changer-pane/ratio-tap-changer-pane-utils';
import { genericColumnOfPropertiesEditPopup } from '../common/column-properties';
import {
    booleanCellEditorConfig,
    enumCellEditorConfig,
    type ICustomCellEditorParams,
    numericalCellEditorConfig,
    standardSelectCellEditorConfig,
} from '../common/cell-editors';
import { SortWay } from 'hooks/use-aggrid-sort';

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
            type: TEXT_TYPE,
            sort: SortWay.ASC,
        },
        {
            id: 'Name',
            field: 'name',
            type: TEXT_TYPE,
        },
        {
            id: 'VoltageLevelIdSide1',
            field: 'voltageLevelId1',
            type: TEXT_TYPE,
        },
        {
            id: 'VoltageLevelIdSide2',
            field: 'voltageLevelId2',
            type: TEXT_TYPE,
        },
        {
            id: 'Country',
            field: 'country',
            type: COUNTRY_TYPE,
        },
        {
            id: 'nominalVoltage1KV',
            field: 'nominalVoltage1',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
        },
        {
            id: 'nominalVoltage2KV',
            field: 'nominalVoltage2',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
        },
        {
            id: 'ratedVoltage1KV',
            field: 'ratedU1',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.ratedU1),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ratedVoltage2KV',
            field: 'ratedU2',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
            ...editableColumnConfig,
            ...numericalCellEditorConfig((params) => params.data.ratedU2),
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerSide1',
            field: 'p1',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ActivePowerSide2',
            field: 'p2',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSide1',
            field: 'q1',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ReactivePowerSide2',
            field: 'q2',
            type: [NUMERIC_1_FRACTION_DIGITS_TYPE, NUMERIC_CAN_BE_INVALIDATED_TYPE],
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'HasLoadTapChangingCapabilities',
            field: 'ratioTapChanger.hasLoadTapChangingCapabilities',
            type: BOOLEAN_TYPE,
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
            type: RATIO_REGULATION_MODES_ENUM_TYPE,
        },
        {
            id: 'TargetVPoint',
            field: 'ratioTapChanger.targetV',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
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
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
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
            type: REGULATION_ENUM_TYPE,
        },
        {
            id: 'RatioRegulatedSide',
            field: 'ratioTapChanger.regulationSide',
            type: SIDE_ENUM_TYPE,
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
            type: NUMERIC_TYPE,
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
            type: NUMERIC_TYPE,
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
            field: 'ratioTapChanger',
            type: NUMERIC_HIGH_TAP_POSITION_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'RatioTap',
            field: 'ratioTapChanger.tapPosition',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
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
            type: PHASE_REGULATING_MODE_ENUM_TYPE,
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
            type: NUMERIC_TYPE,
            columnWidth: MEDIUM_COLUMN_WIDTH,
            fractionDigits: 1,
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
            type: NUMERIC_TYPE,
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
            type: REGULATION_ENUM_TYPE,
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
            type: SIDE_ENUM_TYPE,
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
            type: TEXT_TYPE,
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
            type: NUMERIC_TYPE,
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
            field: 'phaseTapChanger',
            type: NUMERIC_HIGH_TAP_POSITION_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'PhaseTap',
            field: 'phaseTapChanger.tapPosition',
            type: NUMERIC_0_FRACTION_DIGITS_TYPE,
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
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'x',
            field: 'x',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'g',
            field: 'g',
            type: NUMERIC_UNIT_TO_MICRO_UNIT_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'b',
            field: 'b',
            type: NUMERIC_UNIT_TO_MICRO_UNIT_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'ratedNominalPower',
            field: 'ratedS',
            type: NUMERIC_1_FRACTION_DIGITS_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected1',
            field: 'terminal1Connected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        {
            id: 'connected2',
            field: 'terminal2Connected',
            type: BOOLEAN_TYPE,
            getQuickFilterText: excludeFromGlobalFilter,
        },
        genericColumnOfPropertiesEditPopup,
    ],
} as const satisfies ReadonlyDeep<SpreadsheetTabDefinition>;
