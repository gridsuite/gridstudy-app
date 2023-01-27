/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

// We have to import the store to run the unit tests, even if your IDE is showing that the import is unused
// eslint-disable-next-line no-use-before-define
import { store } from './store';
import { reducer } from './reducer';
import {
    resetNetworkAreaDiagramDepth,
    incrementNetworkAreaDiagramDepth,
    decrementNetworkAreaDiagramDepth,
    setFullScreenDiagram,
    openDiagram,
} from './actions';
import { SvgType, ViewState } from '../components/diagrams/diagram-common';

test('reducer.RESET_NETWORK_AREA_DIAGRAM_DEPTH', () => {
    const initialState = { networkAreaDiagramDepth: 12 };
    const expectedState = { networkAreaDiagramDepth: 0 };

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
            { id: 35, svgType: SvgType.VOLTAGE_LEVEL, state: ViewState.MINIMIZED },
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

    // Open a NAD that is already minimized

    // Open a NAD when another NAD is already open

    // Open a NAD when another NAD is already minimized

    // Open a NAD when there is no other NAD and an SLD is in fullscreen

    // Open a NAD when there is another opened NAD and an SLD is in fullscreen
});
