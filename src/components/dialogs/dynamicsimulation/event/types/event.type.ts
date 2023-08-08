/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export enum EventType {
    DISCONNECT = 'Disconnect',
    STEP = 'Step',
    NODE_FAULT = 'NodeFault',
}
export type EventPropertyName =
    | 'equipmentType'
    | 'eventType'
    | 'staticId'
    | 'startTime'
    | 'disconnectOnly';

export type Event = {
    [Property in EventPropertyName]?: any;
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
    label: string;
    isRequired?: boolean;
    default?: any;
    values?: {
        id: string;
        label: string;
    }[];
    unit?: string;
};

export type EventDefinition = {
    [Property in EventPropertyName]?: EventPropertyDefinition;
};
