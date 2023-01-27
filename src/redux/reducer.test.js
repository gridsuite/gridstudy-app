/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';

import { store } from './store';
import { reducer } from './reducer';
import {
    DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
    INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH, OPEN_DIAGRAM,
    RESET_NETWORK_AREA_DIAGRAM_DEPTH,
    SET_FULLSCREEN_DIAGRAM
} from "./actions";
import { SvgType, ViewState } from "../components/diagrams/diagram-common";

test('reducer.RESET_NETWORK_AREA_DIAGRAM_DEPTH', () => {
    const initialState = { networkAreaDiagramDepth: 12 };
    const expectedState = { networkAreaDiagramDepth: 0 };

    expect(
        reducer(initialState, {
            type: RESET_NETWORK_AREA_DIAGRAM_DEPTH,
        })
    ).toEqual(expectedState);
});

test('reducer.INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH', () => {
    const initialState = { networkAreaDiagramDepth: 12 };
    const expectedState = { networkAreaDiagramDepth: 13 };

    expect(
        reducer(initialState, {
            type: INCREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
        })
    ).toEqual(expectedState);
});

test('reducer.DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH', () => {
    const initialState = { networkAreaDiagramDepth: 12 };
    const expectedState = { networkAreaDiagramDepth: 11 };

    expect(
        reducer(initialState, {
            type: DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
        })
    ).toEqual(expectedState);

    const initialState2 = { networkAreaDiagramDepth: 0 };
    const expectedState2 = { networkAreaDiagramDepth: 0 };

    expect(
        reducer(initialState2, {
            type: DECREMENT_NETWORK_AREA_DIAGRAM_DEPTH,
        })
    ).toEqual(expectedState2);
});

test('reducer.SET_FULLSCREEN_DIAGRAM', () => {
    // From initial values
    const initialState = { fullScreenDiagram: null };
    const expectedState = {
        fullScreenDiagram: { id: 3, svgType: SvgType.VOLTAGE_LEVEL },
    };

    expect(
        reducer(initialState, {
            type: SET_FULLSCREEN_DIAGRAM,
            diagramId: 3,
            svgType: SvgType.VOLTAGE_LEVEL,
        })
    ).toEqual(expectedState);

    // Changing the fullscreen diagram
    const initialState2 = {
        fullScreenDiagram: { id: 6, svgType: SvgType.NETWORK_AREA_DIAGRAM },
    };
    const expectedState2 = {
        fullScreenDiagram: { id: 12, svgType: SvgType.SUBSTATION },
    };

    expect(
        reducer(initialState2, {
            type: SET_FULLSCREEN_DIAGRAM,
            diagramId: 12,
            svgType: SvgType.SUBSTATION,
        })
    ).toEqual(expectedState2);

    // Removing the fullscreen
    const initialState3 = {
        fullScreenDiagram: { id: 18, svgType: SvgType.NETWORK_AREA_DIAGRAM },
    };
    const expectedState3 = { fullScreenDiagram: { id: null } };

    expect(
        reducer(initialState3, {
            type: SET_FULLSCREEN_DIAGRAM,
            diagramId: null,
            svgType: undefined,
        })
    ).toEqual(expectedState3);
});

test('reducer.OPEN_DIAGRAM.sld_specific', () => {
    // Open a SLD from an empty diagramStates
    const initialState = { diagramStates: [] };
    const expectedState = { diagramStates: [{id: 65,
            svgType: SvgType.SUBSTATION,
            state: ViewState.OPENED,}] };

    expect(
        reducer(initialState, {
            type: OPEN_DIAGRAM,
            id: 65,
            svgType: SvgType.SUBSTATION,
        })
    ).toEqual(expectedState);

    // Open a SLD that is already opened

    // Open a SLD that is already minimized

    // Open a SLD that is already pinned

    // Open a SLD when a NAD with the same ID is already opened

    // Open a SLD in fullscreen instead of another diagram

});

test('reducer.OPEN_DIAGRAM.nad_specific', () => {
    // Open a NAD from an empty diagramStates
    const initialState = { diagramStates: [] };
    const expectedState = { diagramStates: [{id: 65,
            svgType: SvgType.SUBSTATION,
            state: ViewState.OPENED,}] };

    expect(
        reducer(initialState, {
            type: OPEN_DIAGRAM,
            id: 65,
            svgType: SvgType.SUBSTATION,
        })
    ).toEqual(expectedState);

    // Open a NAD that is already opened

    // Open a NAD that is already minimized

    // Open a SLD that is already pinned

    // Open a SLD when a NAD with the same ID is already opened

    // Open a SLD in fullscreen instead of another diagram

});
