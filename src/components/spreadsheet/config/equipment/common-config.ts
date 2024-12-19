/**
 * Copyright (c) 2021, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { ReadonlyDeep } from 'type-fest';
import { type CustomColDef } from '../../../custom-aggrid/custom-aggrid-header.type';
import type { CellStyleFunc, EditableCallback } from 'ag-grid-community';
import { EQUIPMENT_TYPES } from '../../../utils/equipment-types';
import {
    fetchBatteries,
    fetchBusbarSections,
    fetchBuses,
    fetchDanglingLines,
    fetchGenerators,
    fetchHvdcLines,
    fetchLccConverterStations,
    fetchLines,
    fetchLoads,
    fetchShuntCompensators,
    fetchStaticVarCompensators,
    fetchSubstations,
    fetchThreeWindingsTransformers,
    fetchTieLines,
    fetchTwoWindingsTransformers,
    fetchVoltageLevels,
    fetchVscConverterStations,
} from '../../../../services/study/network';
import { EquipmentFetcher, SpreadsheetEquipmentType } from '../spreadsheet.type';

type TapPositionsType = {
    lowTapPosition: number;
    highTapPosition: number;
};

export const getFetchers = (equipmentType: SpreadsheetEquipmentType): EquipmentFetcher[] => {
    switch (equipmentType) {
        case EQUIPMENT_TYPES.SUBSTATION:
            return [fetchSubstations];
        case EQUIPMENT_TYPES.VOLTAGE_LEVEL:
            return [fetchVoltageLevels];
        case EQUIPMENT_TYPES.LINE:
            return [fetchLines];
        case EQUIPMENT_TYPES.TIE_LINE:
            return [fetchTieLines];
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
            return [fetchTwoWindingsTransformers];
        case EQUIPMENT_TYPES.THREE_WINDINGS_TRANSFORMER:
            return [fetchThreeWindingsTransformers];
        case EQUIPMENT_TYPES.HVDC_LINE:
            return [fetchHvdcLines];
        case EQUIPMENT_TYPES.GENERATOR:
            return [fetchGenerators];
        case EQUIPMENT_TYPES.BATTERY:
            return [fetchBatteries];
        case EQUIPMENT_TYPES.LOAD:
            return [fetchLoads];
        case EQUIPMENT_TYPES.SHUNT_COMPENSATOR:
            return [fetchShuntCompensators];
        case EQUIPMENT_TYPES.DANGLING_LINE:
            return [fetchDanglingLines];
        case EQUIPMENT_TYPES.STATIC_VAR_COMPENSATOR:
            return [fetchStaticVarCompensators];
        case EQUIPMENT_TYPES.VSC_CONVERTER_STATION:
            return [fetchVscConverterStations];
        case EQUIPMENT_TYPES.LCC_CONVERTER_STATION:
            return [fetchLccConverterStations];
        case EQUIPMENT_TYPES.BUS:
            return [fetchBuses];
        case EQUIPMENT_TYPES.BUSBAR_SECTION:
            return [fetchBusbarSections];
    }
};

export const typeAndFetchers = <TEquipType extends SpreadsheetEquipmentType>(equipmentType: TEquipType) =>
    ({
        type: equipmentType,
        fetchers: getFetchers(equipmentType),
    } as const);

export const generateTapPositions = (params: TapPositionsType) => {
    return params ? Array.from(Array(params.highTapPosition - params.lowTapPosition + 1).keys()) : [];
};

export const isEditable: EditableCallback = (params) => params.context.isEditing && params.node.rowPinned === 'top';

export const editableCellStyle: CellStyleFunc = (params) => {
    if (isEditable(params)) {
        if (Object.keys(params.context.editErrors).includes(params.column.getColId())) {
            return params.context.theme.editableCellError;
        } else {
            return params.context.theme.editableCell;
        }
    }
    return null;
};

export const editableColumnConfig = {
    editable: isEditable,
    cellStyle: editableCellStyle,
} as const satisfies Partial<ReadonlyDeep<CustomColDef>>;

//this function enables us to exclude some columns from the computation of the spreadsheet global filter
// The columns we want to include in the global filter at the date of this comment: ID (all), Name, Country, Type and Nominal Voltage (all).
// All the others should be excluded.
export const excludeFromGlobalFilter = () => '' as const;
