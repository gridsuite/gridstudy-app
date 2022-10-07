/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useNavigate, useLocation } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import { parse, stringify } from 'qs';
import { SvgType } from './single-line-diagram';
import { useState } from 'react';

export const ViewState = {
    PINNED: 'pinned',
    MINIMIZED: 'minimized',
    OPENED: 'opened',
};

export function getArray(value) {
    if (value === undefined) return [];
    return !Array.isArray(value) ? [value] : value;
}

const arrayFormat = 'indices';

export const useSingleLineDiagram = (
    sldStateChangeCallback = () => console.log('a')
) => {
    const [sldState, setSldState] = useState([]);
    const navigate = useNavigate();
    const location = useLocation();

    const openSld = useCallback(
        (type, id) => {
            const sldToOpenIndex = sldState.findIndex((sld) => sld.id === id);

            // if sld was in state already, and was PINNED or OPENED, nothing happens
            if (
                sldToOpenIndex >= 0 &&
                [ViewState.OPENED, ViewState.PINNED].includes(
                    sldState[sldToOpenIndex].state
                )
            ) {
                return;
            }
            setSldState((oldState) => {
                const oldSldState = [...oldState];
                // in the other cases, we will open the targeted sld
                // previously opened sld is now MINIMIZED
                const previouslyOpenedSldIndex = oldSldState.findIndex(
                    (sld) => sld.state === ViewState.OPENED
                );
                if (previouslyOpenedSldIndex >= 0) {
                    oldSldState[previouslyOpenedSldIndex].state =
                        ViewState.MINIMIZED;
                }

                // if the target sld was already in the state, hence in MINIMIZED state, we change its state to OPENED
                if (sldToOpenIndex >= 0) {
                    oldSldState[sldToOpenIndex].state = ViewState.OPENED;
                } else {
                    oldSldState.push({
                        id: id,
                        type: type,
                        state: ViewState.OPENED,
                    });
                }
                console.log('OPENED SLD', oldSldState);

                return oldSldState;
            });
        },
        [sldState]
    );

    const togglePinSld = useCallback((id) => {
        setSldState((oldState) => {
            const oldSldState = [...oldState];
            // search targeted sld among the sldState
            const sldToPinToggleIndex = oldSldState.findIndex(
                (sld) => sld.id === id
            );
            if (sldToPinToggleIndex >= 0) {
                // when found, if was opened, it's now PINNED
                const sldToPinState = oldSldState[sldToPinToggleIndex].state;
                if (sldToPinState === ViewState.OPENED) {
                    oldSldState[sldToPinToggleIndex].state = ViewState.PINNED;
                } else if (sldToPinState === ViewState.PINNED) {
                    // if sld is unpinned, the sld that had the state OPENED is now MINIMIZED
                    const currentlyOpenedSldIndex = oldSldState.findIndex(
                        (sld) => sld.state === ViewState.OPENED
                    );
                    if (currentlyOpenedSldIndex >= 0) {
                        oldSldState[currentlyOpenedSldIndex].state =
                            ViewState.MINIMIZED;
                    }
                    oldSldState[sldToPinToggleIndex].state = ViewState.OPENED;
                }
            }
            console.log('TOGGLE PIN SLD', oldSldState);

            return oldSldState;
        });
    }, []);

    useEffect(() => {
        console.log(sldStateChangeCallback);
        console.log('USE EFFECT 1');
    }, [sldState]);

    const minimizeSld = useCallback((id) => {
        setSldState((oldState) => {
            const oldSldState = [...oldState];
            const sldToMinizeIndex = oldSldState.findIndex(
                (sld) => sld.id === id
            );
            if (sldToMinizeIndex >= 0) {
                oldSldState[sldToMinizeIndex].state = ViewState.MINIMIZED;
            }
            console.log('MINIMIZED SLD', oldSldState);
            return oldSldState;
        });
    }, []);

    const addToSearchParams = useCallback(
        (type, id) => {
            const queryParams = parse(location.search, {
                ignoreQueryPrefix: true,
                arrayFormat,
            });
            const current = getArray(queryParams['views'])
                .filter((item) => item.id !== id)
                .map(({ id, type }) => {
                    return { id, type }; // filter to only id, type
                });
            current.push({ id, type, lastOpen: true });
            navigate(
                location.pathname +
                    stringify(
                        { views: current },
                        { arrayFormat, addQueryPrefix: true }
                    ),
                { replace: true }
            );
        },
        [location.search, location.pathname, navigate]
    );

    const showVoltageLevelDiagram = useCallback(
        (voltageLevelId) => {
            openSld(SvgType.VOLTAGE_LEVEL, voltageLevelId);
            addToSearchParams(SvgType.VOLTAGE_LEVEL, voltageLevelId);
        },
        [addToSearchParams, openSld]
    );

    const showSubstationDiagram = useCallback(
        (substationId) => {
            openSld(SvgType.SUBSTATION, substationId);
            addToSearchParams(SvgType.SUBSTATION, substationId);
        },
        [addToSearchParams, openSld]
    );

    const closeDiagram = useCallback(
        (idsToRemove) => {
            const toRemove = new Set(
                Array.isArray(idsToRemove) ? idsToRemove : [idsToRemove]
            );
            const queryParams = parse(location.search, {
                ignoreQueryPrefix: true,
                arrayFormat,
            });
            if (idsToRemove === undefined) {
                navigate(location.pathname, { replace: true });
            } else {
                const views = getArray(queryParams['views']).filter(
                    ({ id }) => !toRemove.has(id)
                );
                navigate(
                    location.pathname +
                        stringify(
                            { views },
                            {
                                addQueryPrefix: true,
                                arrayFormat,
                            }
                        ),
                    { replace: true }
                );
            }
        },
        [navigate, location.search, location.pathname]
    );

    return [
        closeDiagram,
        showVoltageLevelDiagram,
        showSubstationDiagram,
        togglePinSld,
        minimizeSld,
        sldState,
    ];
};
