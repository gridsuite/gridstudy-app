/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    EventDefinition,
    EventType,
    Event,
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

export const NODE_FAULT_EVENT_DEFINITION: EventDefinition = {
    startTime: {
        type: PrimitiveTypes.FLOAT,
        label: 'DynamicSimulationEventPropertyTEvent',
        isRequired: true,
        unit: 's',
    },
    faultTime: {
        type: PrimitiveTypes.FLOAT,
        label: 'DynamicSimulationEventPropertyNodeFaultDuration',
        isRequired: true,
        unit: 's',
    },
    rPu: {
        type: PrimitiveTypes.FLOAT,
        label: 'DynamicSimulationEventPropertyRPu',
        isRequired: true,
        unit: 'pu',
    },
    xPu: {
        type: PrimitiveTypes.FLOAT,
        label: 'DynamicSimulationEventPropertyXPu',
        isRequired: true,
        unit: 'pu',
    },
};

export const eventDefinitions = {
    [EventType.DISCONNECT]: DISCONNECT_EVENT_DEFINITION,
    [EventType.STEP]: undefined,
    [EventType.NODE_FAULT]: NODE_FAULT_EVENT_DEFINITION,
};

export const getEventType = (equipmentType: string): EventType | undefined => {
    let eventType = undefined;
    switch (equipmentType) {
        case EQUIPMENT_TYPES.LINE:
        case EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER:
        case EQUIPMENT_TYPES.LOAD:
        case EQUIPMENT_TYPES.GENERATOR:
            eventType = EventType.DISCONNECT;
            break;
        case EQUIPMENT_TYPES.BUS:
            eventType = EventType.NODE_FAULT;
            break;
        default:
    }

    return eventType;
};

// util methods for Event
export const getStartTime = (event: Event): number => {
    return parseFloat(
        event.properties.find((property) => property.name === 'startTime')
            ?.value ?? ''
    );
};

export const getStartTimeUnit = (event: Event): string => {
    return (
        (event.eventType &&
            eventDefinitions[event.eventType]?.startTime?.unit) ??
        ''
    );
};
