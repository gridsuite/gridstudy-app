/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum COLUMN_TYPES {
    TEXT = 'TEXT',
    ENUM = 'ENUM',
    NUMBER = 'NUMBER',
    BOOLEAN = 'BOOLEAN',
}

export type CustomCellType = {
    cellValue: number;
    tooltipValue: number;
};
