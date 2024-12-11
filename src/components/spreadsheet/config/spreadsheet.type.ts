/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import type { EQUIPMENT_TYPES } from '../../utils/equipment-types';
import { ColDef, ITextFilterParams } from 'ag-grid-community';
import { CrossValidationOptions } from '../utils/equipment-table-utils';
import { CustomColumnConfigProps } from '../custom-columns/custom-column-menu';

export type EquipmentFetcher = (studyUuid: UUID, currentNodeUuid: UUID, substationsIds: string[]) => Promise<any>;

export type SpreadsheetEquipmentType = Exclude<
    EQUIPMENT_TYPES,
    | EQUIPMENT_TYPES.HVDC_CONVERTER_STATION
    | EQUIPMENT_TYPES.SWITCH
    | EQUIPMENT_TYPES.BREAKER
    | EQUIPMENT_TYPES.DISCONNECTOR
>;

export interface SpreadsheetTabDefinition<TData = any, TValue = any> {
    index: number;
    name: string;
    type: SpreadsheetEquipmentType;
    fetchers: EquipmentFetcher[];
    columns: SpreadsheetColDef<TData, TValue>[];
    groovyEquipmentGetter?: string;
}

export interface SpreadsheetColDef<TData = any, TValue = any> extends ColDef<TData, TValue> {
    boolean?: boolean;
    canBeInvalidated?: boolean;
    changeCmd?: string;
    columnWidth?: number;
    crossValidation?: CrossValidationOptions;
    type?: string;
    filter?: string;
    filterParams?: ITextFilterParams;
    fractionDigits?: number;
    getEnumLabel?: (value: string) => string | undefined;
    id: string;
    isCountry?: boolean;
    isDefaultSort?: boolean;
    isEnum?: boolean;
    numeric?: boolean;
    withFluxConvention?: boolean;
    forceDisplayFilterIcon?: boolean;
    tabIndex?: number;
    isCustomColumn?: boolean;
    Menu?: React.FC<CustomColumnConfigProps>;
}
