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
    closeDiagram,
    closeDiagrams,
    decrementNetworkAreaDiagramDepth,
    incrementNetworkAreaDiagramDepth,
    minimizeDiagram,
    openDiagram,
    resetNetworkAreaDiagramDepth,
    setFullScreenDiagram,
    stopDiagramBlink,
    togglePinDiagram,
} from './actions';
import { Reducer } from 'redux';
import { UUID } from 'crypto';
import { DiagramType, ViewState } from '../components/diagrams/diagram.type';

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

test('reducer.SET_FULLSCREEN_DIAGRAM', () => {
    // From initial values
    const initialState = { fullScreenDiagram: null };
    const expectedState = {
        fullScreenDiagram: { id: '3' as UUID, svgType: DiagramType.VOLTAGE_LEVEL },
    };

    expect(reducer(initialState, setFullScreenDiagram('3', DiagramType.VOLTAGE_LEVEL))).toEqual(expectedState);

    // Changing the fullscreen diagram
    const initialState2 = {
        fullScreenDiagram: {
            id: '6' as UUID,
            svgType: DiagramType.NETWORK_AREA_DIAGRAM,
        },
    };
    const expectedState2 = {
        fullScreenDiagram: { id: '12' as UUID, svgType: DiagramType.SUBSTATION },
    };

    expect(reducer(initialState2, setFullScreenDiagram('12', DiagramType.SUBSTATION))).toEqual(expectedState2);

    // Removing the fullscreen
    const initialState3 = {
        fullScreenDiagram: {
            id: '18' as UUID,
            svgType: DiagramType.NETWORK_AREA_DIAGRAM,
        },
    };
    const expectedState3 = { fullScreenDiagram: null };

    expect(reducer(initialState3, setFullScreenDiagram(null))).toEqual(expectedState3);
});

test('reducer.OPEN_DIAGRAM.sld_specific', () => {
    // Open a SLD from an empty diagramStates
    const initialState = { diagramStates: [] };
    const expectedState = {
        diagramStates: [
            {
                id: '65' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState, openDiagram('65', DiagramType.SUBSTATION))).toEqual(expectedState);

    // Open a SLD that is already opened
    const initialState2 = {
        diagramStates: [
            {
                id: '174' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: '174' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
                needsToBlink: true,
            },
        ],
    };

    expect(reducer(initialState2, openDiagram('174', DiagramType.VOLTAGE_LEVEL))).toEqual(expectedState2);

    // Open a SLD that is already minimized
    const initialState3 = {
        diagramStates: [
            {
                id: '34' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: '35' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: '35' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '34' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState3, openDiagram('34' as UUID, DiagramType.SUBSTATION))).toEqual(expectedState3);

    // Open a SLD that is already pinned
    const initialState4 = {
        diagramStates: [
            {
                id: '99' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState4 = {
        diagramStates: [
            {
                id: '99' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
                needsToBlink: true,
            },
        ],
    };

    expect(reducer(initialState4, openDiagram('99' as UUID, DiagramType.VOLTAGE_LEVEL))).toEqual(expectedState4);

    // Open a SLD when a NAD with the same ID is already opened
    const initialState5 = {
        diagramStates: [
            {
                id: '50' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState5 = {
        diagramStates: [
            {
                id: '50' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '50' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState5, openDiagram('50', DiagramType.SUBSTATION))).toEqual(expectedState5);

    // Open a SLD when there are other opened and pinned SLD
    const initialState6 = {
        diagramStates: [
            {
                id: '101' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '102' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '103' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '104' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            }, // Should be minimized
            {
                id: '105' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: '106' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState6 = {
        diagramStates: [
            {
                id: '101' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '102' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '103' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '104' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '105' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: '106' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '107' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            }, // The new SLD is the only opened SLD
        ],
    };

    expect(reducer(initialState6, openDiagram('107', DiagramType.SUBSTATION))).toEqual(expectedState6);

    // Open a SLD in fullscreen instead of another diagram
    const initialState7 = {
        diagramStates: [
            {
                id: '82' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: '83' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
        ],
        fullScreenDiagram: { id: '82', svgType: DiagramType.SUBSTATION },
    };
    const expectedState7 = {
        diagramStates: [
            {
                id: '82' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: '83' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '503' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
        ],
        fullScreenDiagram: { id: '503', svgType: DiagramType.VOLTAGE_LEVEL },
    };

    expect(reducer(initialState7, openDiagram('503', DiagramType.VOLTAGE_LEVEL))).toEqual(expectedState7);
});

test('reducer.OPEN_DIAGRAM.nad_specific', () => {
    // Open a NAD from an empty diagramStates
    const initialState = { diagramStates: [] };
    const expectedState = {
        diagramStates: [
            {
                id: '37' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState, openDiagram('37', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState);

    // Open a NAD that is already opened
    const initialState2 = {
        diagramStates: [
            {
                id: '18' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: '18' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState2, openDiagram('18', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState2);

    // Open a NAD that is already minimized
    const initialState3 = {
        diagramStates: [
            {
                id: '51' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: '51' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState3, openDiagram('51', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState3);

    // Open a NAD when another NAD is already open
    const initialState4 = {
        diagramStates: [
            {
                id: '74' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState4 = {
        diagramStates: [
            {
                id: '74' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '22' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState4, openDiagram('22', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState4);

    // Open a NAD when another NAD is already minimized
    const initialState5 = {
        diagramStates: [
            {
                id: '33' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
        ],
    };
    const expectedState5 = {
        diagramStates: [
            {
                id: '33' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '44' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState5, openDiagram('44' as UUID, DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState5);

    // Open a NAD when there is no other NAD and an SLD is in fullscreen
    const initialState6 = {
        diagramStates: [
            {
                id: '38' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
        fullScreenDiagram: { id: '38' as UUID, svgType: DiagramType.VOLTAGE_LEVEL },
    };
    const expectedState6 = {
        diagramStates: [
            {
                id: '38' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: '28' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
        fullScreenDiagram: {
            id: '28' as UUID,
            svgType: DiagramType.NETWORK_AREA_DIAGRAM,
        },
    };

    expect(reducer(initialState6, openDiagram('28' as UUID, DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState6);

    // Open a NAD when there is another opened NAD and an SLD is in fullscreen
    const initialState7 = {
        diagramStates: [
            {
                id: '14' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: '14' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
        ],
        fullScreenDiagram: { id: '14' as UUID, svgType: DiagramType.VOLTAGE_LEVEL },
    };
    const expectedState7 = {
        diagramStates: [
            {
                id: '14' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: '14',
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '39' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
        fullScreenDiagram: {
            id: '14' as UUID,
            svgType: DiagramType.NETWORK_AREA_DIAGRAM,
        },
    };

    expect(reducer(initialState7, openDiagram('39', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState7);

    // Open a NAD when there is another NAD in fullscreen
    const initialState8 = {
        diagramStates: [
            {
                id: '85' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
        fullScreenDiagram: {
            id: '85' as UUID,
            svgType: DiagramType.NETWORK_AREA_DIAGRAM,
        },
    };
    const expectedState8 = {
        diagramStates: [
            {
                id: '85' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
            {
                id: '79' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
        fullScreenDiagram: {
            id: '85' as UUID,
            svgType: DiagramType.NETWORK_AREA_DIAGRAM,
        },
    };

    expect(reducer(initialState8, openDiagram('79', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState8);
});

test('reducer.MINIMIZE_DIAGRAM.sld_specific', () => {
    // Try to minimize a nonexistant SLD
    const initialState = { diagramStates: [] };
    const expectedState = { diagramStates: [] };

    expect(reducer(initialState, minimizeDiagram('1', DiagramType.VOLTAGE_LEVEL))).toEqual(expectedState);

    // Try to minimize a nonexistant SLD (bis)
    const initialState2 = {
        diagramStates: [
            {
                id: '12' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: '12' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState2, minimizeDiagram('33', DiagramType.VOLTAGE_LEVEL))).toEqual(expectedState2);

    // Minimize an open SLD
    const initialState3 = {
        diagramStates: [
            {
                id: '7' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: '7' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
        ],
    };

    expect(reducer(initialState3, minimizeDiagram('7', DiagramType.SUBSTATION))).toEqual(expectedState3);

    // Minimize a pinned SLD
    const initialState4 = {
        diagramStates: [
            {
                id: '63' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: '47' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '25' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState4 = {
        diagramStates: [
            {
                id: '63' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: '47' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: '25' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState4, minimizeDiagram('47', DiagramType.SUBSTATION))).toEqual(expectedState4);

    // Minimize an already minimized SLD
    const initialState5 = {
        diagramStates: [
            {
                id: '1' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '1' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '22' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState5 = {
        diagramStates: [
            {
                id: '1' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '1' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '22' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(reducer(initialState5, minimizeDiagram('1', DiagramType.VOLTAGE_LEVEL))).toEqual(expectedState5);
});

test('reducer.MINIMIZE_DIAGRAM.nad_specific', () => {
    // Minimize a NAD when there are multiple open NAD
    const initialState = {
        diagramStates: [
            {
                id: '10' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: '200' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '10' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '200' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '3' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: '4' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: '10' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: '200' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '10' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
            {
                id: '200' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
            {
                id: '3' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: '4' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
        ],
    };

    expect(reducer(initialState, minimizeDiagram('200', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState);
});

test('reducer.TOGGLE_PIN_DIAGRAM.sld_specific', () => {
    // Toggle a non existant diagram
    const initialState = {
        diagramStates: [
            {
                id: '1' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: '2' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: '1' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: '2' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(reducer(initialState, togglePinDiagram('1', DiagramType.SUBSTATION))).toEqual(expectedState);

    // Pin a SLD
    const initialState2 = {
        diagramStates: [
            {
                id: '1' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '2' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: '1' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '2' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(reducer(initialState2, togglePinDiagram('2', DiagramType.SUBSTATION))).toEqual(expectedState2);

    // Unpin a SLD when no other SLD is already open
    const initialState3 = {
        diagramStates: [
            {
                id: '31' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: '32' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '33' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: '31' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: '32' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: '33' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(reducer(initialState3, togglePinDiagram('32', DiagramType.SUBSTATION))).toEqual(expectedState3);

    // Unpin a SLD when there is already another opened SLD
    const initialState4 = {
        diagramStates: [
            {
                id: '10' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: '20' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '30' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: '40' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: '50' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState4 = {
        diagramStates: [
            {
                id: '10' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: '20' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '30' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: '40' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '50' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState4, togglePinDiagram('40', DiagramType.VOLTAGE_LEVEL))).toEqual(expectedState4);
});

test('reducer.TOGGLE_PIN_DIAGRAM.nad_specific', () => {
    // Toggle a non existant diagram
    const initialState = {
        diagramStates: [
            {
                id: '1' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: '2' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: '1' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: '2' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(reducer(initialState, togglePinDiagram('1', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState);

    // Unpin a NAD
    const initialState2 = {
        diagramStates: [
            {
                id: '1' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: '2' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
            {
                id: '3' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: '1' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: '2' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '3' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState2, togglePinDiagram('3', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState2);

    // Pin a NAD
    const initialState3 = {
        diagramStates: [
            {
                id: '3' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '4' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '5' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: '3' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
            {
                id: '4' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: '5',
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(reducer(initialState3, togglePinDiagram('3', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState3);
});

test('reducer.CLOSE_DIAGRAM', () => {
    // Try to close a non existant diagram
    const initialState = {
        diagramStates: [
            {
                id: '6' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: '6' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(reducer(initialState, closeDiagram('6', DiagramType.SUBSTATION))).toEqual(expectedState);

    // Close a SLD
    const initialState2 = {
        diagramStates: [
            {
                id: '3' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: '54' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: '3' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(reducer(initialState2, closeDiagram('54', DiagramType.SUBSTATION))).toEqual(expectedState2);

    // Close a NAD
    const initialState3 = {
        diagramStates: [
            {
                id: '32' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
            {
                id: '64' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
            {
                id: '64' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: '82' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: '64' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState3, closeDiagram('64', DiagramType.NETWORK_AREA_DIAGRAM))).toEqual(expectedState3);
});

test('reducer.CLOSE_DIAGRAMS', () => {
    // Close multiple diagrams, some exist, some don't
    const initialState = {
        diagramStates: [
            {
                id: '10' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: '20' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '30' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: '5' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: '10' as UUID,
                svgType: DiagramType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: '10' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: '20' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '5' as UUID,
                svgType: DiagramType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState, closeDiagrams(['6', '10', '30', '455']))).toEqual(expectedState);
});

test('reducer.STOP_DIAGRAM_BLINK', () => {
    const initialState = {
        diagramStates: [
            {
                id: '102' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: '202' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
                needsToBlink: true,
            },
            {
                id: '302' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
                needsToBlink: true,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: '102' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: '202' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: '302' as UUID,
                svgType: DiagramType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState, stopDiagramBlink())).toEqual(expectedState);
});
