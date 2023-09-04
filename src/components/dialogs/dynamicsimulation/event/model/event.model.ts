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
import { EQUIPMENT_TYPES } from '../../../../utils/equipment-types';

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
                label: 'Branch.Side.ONE',
                id: 'Branch.Side.ONE',
            },
            {
                label: 'Branch.Side.TWO',
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

export const getEventType = (equipmentType: string): EventType | undefined => {
    let eventType = undefined;
    switch (equipmentType) {
        case EQUIPMENT_TYPES.LINE:
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
            eventType = EventType.DISCONNECT;
            break;
        default:
    }

    return eventType;
};
