/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    EventDefinition,
    EventType,
    PrimitiveTypes,
} from '../types/event.type';

export const DISCONNECT_EVENT_DEFINITION: EventDefinition = {
    startTime: {
        type: PrimitiveTypes.FLOAT,
        label: 'DynamicSimulationEventPropertyTEvent',
        isRequired: true,
        unit: 's',
    },
    disconnectOnly: {
        type: PrimitiveTypes.ENUM,
        label: 'DynamicSimulationEventPropertySide',
        values: [
            {
                label: 'OriginSide',
                id: 'Branch.Side.ONE',
            },
            {
                label: 'ExtremitySide',
                id: 'Branch.Side.TWO',
            },
        ],
    },
};

export const eventDefinitions = {
    [EventType.DISCONNECT]: DISCONNECT_EVENT_DEFINITION,
    [EventType.STEP]: undefined,
    [EventType.NODE_FAULT]: undefined,
};
