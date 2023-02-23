/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

// Because of a circular import issue, we have to import the store to run the
// unit tests, even if your IDE is showing that the import is unused.
// eslint-disable-next-line no-use-before-define
import { store } from './store';
import { reducer } from './reducer';
import {
    resetNetworkAreaDiagramDepth,
    incrementNetworkAreaDiagramDepth,
    decrementNetworkAreaDiagramDepth,
    setFullScreenDiagram,
    openDiagram,
    minimizeDiagram,
    togglePinDiagram,
    closeDiagram,
    closeDiagrams,
} from './actions';
import { SvgType, ViewState } from '../components/diagrams/diagram-common';

test('reducer.RESET_NETWORK_AREA_DIAGRAM_DEPTH', () => {
    const initialState = { networkAreaDiagramDepth: 12 };
    const expectedState = {
        networkAreaDiagramDepth: 0,
    };

    expect(reducer(initialState, resetNetworkAreaDiagramDepth())).toEqual(
        expectedState
    );
});

test('reducer.INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH', () => {
    const initialState = { networkAreaDiagramDepth: 12 };
    const expectedState = { networkAreaDiagramDepth: 13 };

    expect(reducer(initialState, incrementNetworkAreaDiagramDepth())).toEqual(
        expectedState
    );
});

test('reducer.DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH', () => {
    const initialState = { networkAreaDiagramDepth: 12 };
    const expectedState = { networkAreaDiagramDepth: 11 };

    expect(reducer(initialState, decrementNetworkAreaDiagramDepth())).toEqual(
        expectedState
    );

    const initialState2 = { networkAreaDiagramDepth: 0 };
    const expectedState2 = { networkAreaDiagramDepth: 0 };

    expect(reducer(initialState2, decrementNetworkAreaDiagramDepth())).toEqual(
        expectedState2
    );
});

test('reducer.SET_FULLSCREEN_DIAGRAM', () => {
    // From initial values
    const initialState = { fullScreenDiagram: null };
    const expectedState = {
        fullScreenDiagram: { id: 3, svgType: SvgType.VOLTAGE_LEVEL },
    };

    expect(
        reducer(initialState, setFullScreenDiagram(3, SvgType.VOLTAGE_LEVEL))
    ).toEqual(expectedState);

    // Changing the fullscreen diagram
    const initialState2 = {
        fullScreenDiagram: { id: 6, svgType: SvgType.NETWORK_AREA_DIAGRAM },
    };
    const expectedState2 = {
        fullScreenDiagram: { id: 12, svgType: SvgType.SUBSTATION },
    };

    expect(
        reducer(initialState2, setFullScreenDiagram(12, SvgType.SUBSTATION))
    ).toEqual(expectedState2);

    // Removing the fullscreen
    const initialState3 = {
        fullScreenDiagram: { id: 18, svgType: SvgType.NETWORK_AREA_DIAGRAM },
    };
    const expectedState3 = { fullScreenDiagram: { id: null } };

    expect(reducer(initialState3, setFullScreenDiagram(null))).toEqual(
        expectedState3
    );
});

test('reducer.OPEN_DIAGRAM.sld_specific', () => {
    // Open a SLD from an empty diagramStates
    const initialState = { diagramStates: [] };
    const expectedState = {
        diagramStates: [
            { id: 65, svgType: SvgType.SUBSTATION, state: ViewState.OPENED },
        ],
    };

    expect(reducer(initialState, openDiagram(65, SvgType.SUBSTATION))).toEqual(
        expectedState
    );

    // Open a SLD that is already opened
    const initialState2 = {
        diagramStates: [
            { id: 74, svgType: SvgType.VOLTAGE_LEVEL, state: ViewState.OPENED },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            { id: 74, svgType: SvgType.VOLTAGE_LEVEL, state: ViewState.OPENED },
        ],
    };

    expect(
        reducer(initialState2, openDiagram(74, SvgType.VOLTAGE_LEVEL))
    ).toEqual(expectedState2);

    // Open a SLD that is already minimized
    const initialState3 = {
        diagramStates: [
            { id: 34, svgType: SvgType.SUBSTATION, state: ViewState.MINIMIZED },
            { id: 35, svgType: SvgType.VOLTAGE_LEVEL, state: ViewState.OPENED },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            { id: 34, svgType: SvgType.SUBSTATION, state: ViewState.OPENED },
            {
                id: 35,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
        ],
    };

    expect(reducer(initialState3, openDiagram(34, SvgType.SUBSTATION))).toEqual(
        expectedState3
    );

    // Open a SLD that is already pinned
    const initialState4 = {
        diagramStates: [
            { id: 99, svgType: SvgType.VOLTAGE_LEVEL, state: ViewState.PINNED },
        ],
    };
    const expectedState4 = {
        diagramStates: [
            { id: 99, svgType: SvgType.VOLTAGE_LEVEL, state: ViewState.PINNED },
        ],
    };

    expect(
        reducer(initialState4, openDiagram(99, SvgType.VOLTAGE_LEVEL))
    ).toEqual(expectedState4);

    // Open a SLD when a NAD with the same ID is already opened
    const initialState5 = {
        diagramStates: [
            {
                id: 50,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState5 = {
        diagramStates: [
            {
                id: 50,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            { id: 50, svgType: SvgType.SUBSTATION, state: ViewState.OPENED },
        ],
    };

    expect(reducer(initialState5, openDiagram(50, SvgType.SUBSTATION))).toEqual(
        expectedState5
    );

    // Open a SLD when there are other opened and pinned SLD
    const initialState6 = {
        diagramStates: [
            {
                id: 101,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            { id: 102, svgType: SvgType.SUBSTATION, state: ViewState.PINNED },
            {
                id: 103,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: 104,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            }, // Should be minimized
            {
                id: 105,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: 106,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState6 = {
        diagramStates: [
            {
                id: 101,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            { id: 102, svgType: SvgType.SUBSTATION, state: ViewState.PINNED },
            {
                id: 103,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: 104,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: 105,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: 106,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            { id: 107, svgType: SvgType.SUBSTATION, state: ViewState.OPENED }, // The new SLD is the only opened SLD
        ],
    };

    expect(
        reducer(initialState6, openDiagram(107, SvgType.SUBSTATION))
    ).toEqual(expectedState6);

    // Open a SLD in fullscreen instead of another diagram
    const initialState7 = {
        diagramStates: [
            {
                id: 82,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: 83,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
        ],
        fullScreenDiagram: { id: 82, svgType: SvgType.SUBSTATION },
    };
    const expectedState7 = {
        diagramStates: [
            {
                id: 82,
                svgType: SvgType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: 83,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 503,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
        ],
        fullScreenDiagram: { id: 503, svgType: SvgType.VOLTAGE_LEVEL },
    };

    expect(
        reducer(initialState7, openDiagram(503, SvgType.VOLTAGE_LEVEL))
    ).toEqual(expectedState7);
});

test('reducer.OPEN_DIAGRAM.nad_specific', () => {
    // Open a NAD from an empty diagramStates
    const initialState = { diagramStates: [] };
    const expectedState = {
        diagramStates: [
            {
                id: 37,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(
        reducer(initialState, openDiagram(37, SvgType.NETWORK_AREA_DIAGRAM))
    ).toEqual(expectedState);

    // Open a NAD that is already opened
    const initialState2 = {
        diagramStates: [
            {
                id: 18,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: 18,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(
        reducer(initialState2, openDiagram(18, SvgType.NETWORK_AREA_DIAGRAM))
    ).toEqual(expectedState2);

    // Open a NAD that is already minimized
    const initialState3 = {
        diagramStates: [
            {
                id: 51,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: 51,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(
        reducer(initialState3, openDiagram(51, SvgType.NETWORK_AREA_DIAGRAM))
    ).toEqual(expectedState3);

    // Open a NAD when another NAD is already open
    const initialState4 = {
        diagramStates: [
            {
                id: 74,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState4 = {
        diagramStates: [
            {
                id: 74,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: 22,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(
        reducer(initialState4, openDiagram(22, SvgType.NETWORK_AREA_DIAGRAM))
    ).toEqual(expectedState4);

    // Open a NAD when another NAD is already minimized
    const initialState5 = {
        diagramStates: [
            {
                id: 33,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
        ],
    };
    const expectedState5 = {
        diagramStates: [
            {
                id: 33,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: 44,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(
        reducer(initialState5, openDiagram(44, SvgType.NETWORK_AREA_DIAGRAM))
    ).toEqual(expectedState5);

    // Open a NAD when there is no other NAD and an SLD is in fullscreen
    const initialState6 = {
        diagramStates: [
            {
                id: 38,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
        fullScreenDiagram: { id: 38, svgType: SvgType.VOLTAGE_LEVEL },
    };
    const expectedState6 = {
        diagramStates: [
            {
                id: 38,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: 28,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
        fullScreenDiagram: { id: 28, svgType: SvgType.NETWORK_AREA_DIAGRAM },
    };

    expect(
        reducer(initialState6, openDiagram(28, SvgType.NETWORK_AREA_DIAGRAM))
    ).toEqual(expectedState6);

    // Open a NAD when there is another opened NAD and an SLD is in fullscreen
    const initialState7 = {
        diagramStates: [
            {
                id: 14,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: 14,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
        ],
        fullScreenDiagram: { id: 14, svgType: SvgType.VOLTAGE_LEVEL },
    };
    const expectedState7 = {
        diagramStates: [
            {
                id: 14,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: 14,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: 39,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
        fullScreenDiagram: { id: 14, svgType: SvgType.NETWORK_AREA_DIAGRAM },
    };

    expect(
        reducer(initialState7, openDiagram(39, SvgType.NETWORK_AREA_DIAGRAM))
    ).toEqual(expectedState7);

    // Open a NAD when there is another NAD in fullscreen
    const initialState8 = {
        diagramStates: [
            {
                id: 85,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
        fullScreenDiagram: { id: 85, svgType: SvgType.NETWORK_AREA_DIAGRAM },
    };
    const expectedState8 = {
        diagramStates: [
            {
                id: 85,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
            {
                id: 79,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
        fullScreenDiagram: { id: 85, svgType: SvgType.NETWORK_AREA_DIAGRAM },
    };

    expect(
        reducer(initialState8, openDiagram(79, SvgType.NETWORK_AREA_DIAGRAM))
    ).toEqual(expectedState8);
});

test('reducer.MINIMIZE_DIAGRAM.sld_specific', () => {
    // Try to minimize a nonexistant SLD
    const initialState = { diagramStates: [] };
    const expectedState = { diagramStates: [] };

    expect(
        reducer(initialState, minimizeDiagram(1, SvgType.VOLTAGE_LEVEL))
    ).toEqual(expectedState);

    // Try to minimize a nonexistant SLD (bis)
    const initialState2 = {
        diagramStates: [
            {
                id: 12,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: 12,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(
        reducer(initialState2, minimizeDiagram(33, SvgType.VOLTAGE_LEVEL))
    ).toEqual(expectedState2);

    // Minimize an open SLD
    const initialState3 = {
        diagramStates: [
            {
                id: 7,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: 7,
                svgType: SvgType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
        ],
    };

    expect(
        reducer(initialState3, minimizeDiagram(7, SvgType.SUBSTATION))
    ).toEqual(expectedState3);

    // Minimize a pinned SLD
    const initialState4 = {
        diagramStates: [
            {
                id: 63,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: 47,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 25,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState4 = {
        diagramStates: [
            {
                id: 63,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: 47,
                svgType: SvgType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: 25,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(
        reducer(initialState4, minimizeDiagram(47, SvgType.SUBSTATION))
    ).toEqual(expectedState4);

    // Minimize an already minimized SLD
    const initialState5 = {
        diagramStates: [
            {
                id: 1,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 1,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: 22,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState5 = {
        diagramStates: [
            {
                id: 1,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 1,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: 22,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(
        reducer(initialState5, minimizeDiagram(1, SvgType.VOLTAGE_LEVEL))
    ).toEqual(expectedState5);
});

test('reducer.MINIMIZE_DIAGRAM.nad_specific', () => {
    // Minimize a NAD when there are multiple open NAD
    const initialState = {
        diagramStates: [
            {
                id: 10,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: 200,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 10,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: 200,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: 3,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: 4,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: 10,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: 200,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 10,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
            {
                id: 200,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
            {
                id: 3,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: 4,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.MINIMIZED,
            },
        ],
    };

    expect(
        reducer(
            initialState,
            minimizeDiagram(200, SvgType.NETWORK_AREA_DIAGRAM)
        )
    ).toEqual(expectedState);
});

test('reducer.TOGGLE_PIN_DIAGRAM.sld_specific', () => {
    // Toggle a non existant diagram
    const initialState = {
        diagramStates: [
            {
                id: 1,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: 2,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: 1,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: 2,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(
        reducer(initialState, togglePinDiagram(1, SvgType.SUBSTATION))
    ).toEqual(expectedState);

    // Pin a SLD
    const initialState2 = {
        diagramStates: [
            {
                id: 1,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: 2,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: 1,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: 2,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(
        reducer(initialState2, togglePinDiagram(2, SvgType.SUBSTATION))
    ).toEqual(expectedState2);

    // Unpin a SLD when no other SLD is already open
    const initialState3 = {
        diagramStates: [
            {
                id: 31,
                svgType: SvgType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: 32,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 33,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: 31,
                svgType: SvgType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: 32,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: 33,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(
        reducer(initialState3, togglePinDiagram(32, SvgType.SUBSTATION))
    ).toEqual(expectedState3);

    // Unpin a SLD when there is already another opened SLD
    const initialState4 = {
        diagramStates: [
            {
                id: 10,
                svgType: SvgType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: 20,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 30,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: 40,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: 50,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState4 = {
        diagramStates: [
            {
                id: 10,
                svgType: SvgType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: 20,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 30,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: 40,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: 50,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(
        reducer(initialState4, togglePinDiagram(40, SvgType.VOLTAGE_LEVEL))
    ).toEqual(expectedState4);
});

test('reducer.TOGGLE_PIN_DIAGRAM.nad_specific', () => {
    // Toggle a non existant diagram
    const initialState = {
        diagramStates: [
            {
                id: 1,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: 2,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: 1,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.OPENED,
            },
            {
                id: 2,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(
        reducer(initialState, togglePinDiagram(1, SvgType.NETWORK_AREA_DIAGRAM))
    ).toEqual(expectedState);

    // Unpin a NAD
    const initialState2 = {
        diagramStates: [
            {
                id: 1,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: 2,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
            {
                id: 3,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: 1,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: 2,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: 3,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(
        reducer(
            initialState2,
            togglePinDiagram(3, SvgType.NETWORK_AREA_DIAGRAM)
        )
    ).toEqual(expectedState2);

    // Pin a NAD
    const initialState3 = {
        diagramStates: [
            {
                id: 3,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: 4,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: 5,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: 3,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
            {
                id: 4,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.MINIMIZED,
            },
            {
                id: 5,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(
        reducer(
            initialState3,
            togglePinDiagram(3, SvgType.NETWORK_AREA_DIAGRAM)
        )
    ).toEqual(expectedState3);
});

test('reducer.CLOSE_DIAGRAM', () => {
    // Try to close a non existant diagram
    const initialState = {
        diagramStates: [
            {
                id: 6,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: 6,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(reducer(initialState, closeDiagram(6, SvgType.SUBSTATION))).toEqual(
        expectedState
    );

    // Close a SLD
    const initialState2 = {
        diagramStates: [
            {
                id: 3,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: 54,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState2 = {
        diagramStates: [
            {
                id: 3,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
        ],
    };

    expect(
        reducer(initialState2, closeDiagram(54, SvgType.SUBSTATION))
    ).toEqual(expectedState2);

    // Close a NAD
    const initialState3 = {
        diagramStates: [
            {
                id: 32,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
            {
                id: 64,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
            {
                id: 64,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: 82,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.PINNED,
            },
        ],
    };
    const expectedState3 = {
        diagramStates: [
            {
                id: 64,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(
        reducer(initialState3, closeDiagram(64, SvgType.NETWORK_AREA_DIAGRAM))
    ).toEqual(expectedState3);
});

test('reducer.CLOSE_DIAGRAMS', () => {
    // Close multiple diagrams, some exist, some don't
    const initialState = {
        diagramStates: [
            {
                id: 10,
                svgType: SvgType.SUBSTATION,
                state: ViewState.MINIMIZED,
            },
            {
                id: 20,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 30,
                svgType: SvgType.SUBSTATION,
                state: ViewState.OPENED,
            },
            {
                id: 5,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
            {
                id: 10,
                svgType: SvgType.VOLTAGE_LEVEL,
                state: ViewState.PINNED,
            },
            {
                id: 10,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };
    const expectedState = {
        diagramStates: [
            {
                id: 20,
                svgType: SvgType.SUBSTATION,
                state: ViewState.PINNED,
            },
            {
                id: 5,
                svgType: SvgType.NETWORK_AREA_DIAGRAM,
                state: ViewState.OPENED,
            },
        ],
    };

    expect(reducer(initialState, closeDiagrams([6, 10, 30, 455]))).toEqual(
        expectedState
    );
});
