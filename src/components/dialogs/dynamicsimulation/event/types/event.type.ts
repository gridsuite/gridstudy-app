/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type Event = {
    [key: string]: any;
};

export enum PrimitiveTypes {
    ENUM = 'ENUM',
    BOOL = 'BOOL',
    INTEGER = 'INTEGER',
    FLOAT = 'FLOAT',
    STRING = 'STRING',
}

export type EventPropertyDefinition = {
    type: PrimitiveTypes;
    labelId: string;
    isRequired?: boolean;
    values?: {
        value: string;
        label: string;
    }[];
};

export type EventDefinition = {
    [key: string]: EventPropertyDefinition;
};
