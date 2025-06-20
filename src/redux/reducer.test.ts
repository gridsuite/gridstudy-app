/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

// Because of a circular import issue, we have to import the store to run the
// unit tests, even if your IDE is showing that the import is unused.
import { Actions, AppState, reducer as appReducer } from './reducer';
import {
    decrementNetworkAreaDiagramDepth,
    incrementNetworkAreaDiagramDepth,
    openDiagram,
    resetNetworkAreaDiagramDepth,
    stopDiagramBlink,
} from './actions';
import { Reducer } from 'redux';
import { UUID } from 'crypto';
import { DiagramType } from '../components/diagrams/diagram.type';

const reducer = appReducer as Reducer<Partial<AppState>, Actions>;

test('reducer.RESET_NETWORK_AREA_DIAGRAM_DEPTH', () => {
    const initialState = { networkAreaDiagramDepth: 12 };
    const expectedState = {
        networkAreaDiagramDepth: 0,
    };

    expect(reducer(initialState, resetNetworkAreaDiagramDepth())).toEqual(expectedState);
});

test('reducer.INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH', () => {
    const initialState = { networkAreaDiagramDepth: 12 };
    const expectedState = { networkAreaDiagramDepth: 13 };

    expect(reducer(initialState, incrementNetworkAreaDiagramDepth())).toEqual(expectedState);
});

test('reducer.DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH', () => {
    const initialState = { networkAreaDiagramDepth: 12 };
    const expectedState = { networkAreaDiagramDepth: 11 };

    expect(reducer(initialState, decrementNetworkAreaDiagramDepth())).toEqual(expectedState);

    const initialState2 = { networkAreaDiagramDepth: 0 };
    const expectedState2 = { networkAreaDiagramDepth: 0 };

    expect(reducer(initialState2, decrementNetworkAreaDiagramDepth())).toEqual(expectedState2);
});

test('reducer.OPEN_DIAGRAM.sld_specific', () => {
    // Open a SLD from an empty diagramStates
    const initialState = { diagramStates: [] };
    const expectedState = {
        diagramStates: [
            {
                id: '65' as UUID,
                svgType: DiagramType.SUBSTATION,
            },
        ],
        latestDiagramEvent: {
            diagramType: 'substation',
            eventType: 'create',
            substationId: '65',
        },
    };

    expect(reducer(initialState, openDiagram('65', DiagramType.SUBSTATION))).toEqual(expectedState);

    // Open a SLD that is already opened
    const initialState2 = {
        diagramStates: [
            {
                id: '174' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: '174' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                needsToBlink: true,
            },
        ],
        latestDiagramEvent: {
            diagramType: 'voltage-level',
            eventType: 'create',
            voltageLevelId: '174',
        },
    };

    expect(reducer(initialState2, openDiagram('174', DiagramType.VOLTAGE_LEVEL))).toEqual(expectedState2);

    // Open a SLD when a NAD with the same ID is already opened
    const initialState5 = {
        diagramStates: [
            {
                id: '50' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            },
        ],
    };
    const expectedState5 = {
        diagramStates: [
            {
                id: '50' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            },
            {
                id: '50' as UUID,
                svgType: DiagramType.SUBSTATION,
            },
        ],
        latestDiagramEvent: {
            diagramType: 'substation',
            eventType: 'create',
            substationId: '50',
        },
    };

    expect(reducer(initialState5, openDiagram('50', DiagramType.SUBSTATION))).toEqual(expectedState5);

    // Open a SLD when there are other opened and pinned SLD
    const initialState6 = {
        diagramStates: [
            {
                id: '101' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            },
            {
                id: '102' as UUID,
                svgType: DiagramType.SUBSTATION,
            },
            {
                id: '103' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
            },
        ],
    };
    const expectedState6 = {
        diagramStates: [
            {
                id: '101' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            },
            {
                id: '102' as UUID,
                svgType: DiagramType.SUBSTATION,
            },
            {
                id: '103' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
            },
            {
                id: '107' as UUID,
                svgType: DiagramType.SUBSTATION,
            },
        ],
        latestDiagramEvent: {
            diagramType: 'substation',
            eventType: 'create',
            substationId: '107',
        },
    };

    expect(reducer(initialState6, openDiagram('107', DiagramType.SUBSTATION))).toEqual(expectedState6);
});

test('reducer.OPEN_DIAGRAM.nad_specific', () => {
    // Open a NAD from an empty diagramStates
    const initialState = { diagramStates: [] };
    const expectedState = {
        diagramStates: [
            {
                id: '37' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            },
        ],
        latestDiagramEvent: {
            diagramType: 'network-area-diagram',
            eventType: 'create',
            voltageLevelIds: ['37'],
        },
    };

    expect(reducer(initialState, openDiagram('37', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState);

    // Open a NAD that is already opened
    const initialState2 = {
        diagramStates: [
            {
                id: '18' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: '18' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                needsToBlink: true,
            },
        ],
        latestDiagramEvent: {
            diagramType: 'network-area-diagram',
            eventType: 'create',
            voltageLevelIds: ['18'],
        },
    };

    expect(reducer(initialState2, openDiagram('18', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState2);

    // Open a NAD when another NAD is already open
    const initialState4 = {
        diagramStates: [
            {
                id: '74' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            },
        ],
    };
    const expectedState4 = {
        diagramStates: [
            {
                id: '74' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            },
            {
                id: '22' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
            },
        ],
        latestDiagramEvent: {
            diagramType: 'network-area-diagram',
            eventType: 'create',
            voltageLevelIds: ['22'],
        },
    };

    expect(reducer(initialState4, openDiagram('22', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState4);
});

test('reducer.STOP_DIAGRAM_BLINK', () => {
    const initialState = {
        diagramStates: [
            {
                id: '102' as UUID,
                svgType: DiagramType.SUBSTATION,
            },
            {
                id: '202' as UUID,
                svgType: DiagramType.SUBSTATION,
                needsToBlink: true,
            },
            {
                id: '302' as UUID,
                svgType: DiagramType.SUBSTATION,
                needsToBlink: true,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: '102' as UUID,
                svgType: DiagramType.SUBSTATION,
            },
            {
                id: '202' as UUID,
                svgType: DiagramType.SUBSTATION,
            },
            {
                id: '302' as UUID,
                svgType: DiagramType.SUBSTATION,
            },
        ],
    };

    expect(reducer(initialState, stopDiagramBlink())).toEqual(expectedState);
});
