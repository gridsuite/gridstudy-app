/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ElementType } from '@gridsuite/commons-ui';
import { EQUIPMENT_TYPES } from '../equipment-types';

export enum DndColumnType {
    TEXT = 'TEXT',
    NUMERIC = 'NUMERIC',
    AUTOCOMPLETE = 'AUTOCOMPLETE',
    CHIP_ITEMS = 'CHIP_ITEMS',
    DIRECTORY_ITEMS = 'DIRECTORY_ITEMS',
}

export interface ColumnBase {
    dataKey: string;
    maxWidth?: number | string;
    width?: number | string;
    label?: string;
    extra?: JSX.Element;
    editable?: boolean;
    type: DndColumnType;
}

export interface ColumnText extends ColumnBase {
    type: DndColumnType.TEXT;
    showErrorMsg?: boolean;
}

export interface ColumnNumeric extends ColumnBase {
    type: DndColumnType.NUMERIC;
    adornment?: { text: string };
    clearable?: boolean;
    textAlign?: 'right' | 'left';
}

export interface ColumnAutocomplete extends ColumnBase {
    type: DndColumnType.AUTOCOMPLETE;
    options: string[];
}

export interface ColumnDirectoryItem extends ColumnBase {
    type: DndColumnType.DIRECTORY_ITEMS;
    equipmentTypes: EQUIPMENT_TYPES[];
    elementType: ElementType;
    titleId: string;
}

export interface ColumnChipsItem extends ColumnBase {
    type: DndColumnType.CHIP_ITEMS;
}

export type DndColumn = ColumnNumeric | ColumnAutocomplete | ColumnText | ColumnDirectoryItem | ColumnChipsItem;
