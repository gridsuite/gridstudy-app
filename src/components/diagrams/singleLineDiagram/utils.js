/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useHistory, useLocation } from 'react-router-dom';
import { useCallback } from 'react';
import { parse, stringify } from 'qs';
import { SvgType } from './single-line-diagram';

export const ViewState = {
    PINNED: 'pinned',
    MINIMIZED: 'minimized',
};

export function getArray(value) {
    if (value === undefined) return [];
    if (!Array.isArray(value.id)) return [value];
    return value.id.map((id, n) => {
        return { id, type: value.type[n] };
    });
}

export const useSingleLineDiagram = () => {
    const history = useHistory();
    const location = useLocation();
    /*
     * http://localhost:3000/studies/62a9cc56-af19-4497-9723-e1988f7d9253?
     * views%5Btype%5D=voltage-level&views%5Bid%5D=_c1d5bfde8f8011e08e4d00247eb1f55e&views%5Btype%5D=voltage-level&views%5Bid%5D=_c1d5bfea8f8011e08e4d00247eb1f55e
     * */
    const addToSearchParams = useCallback(
        (type, id) => {
            const queryParams = parse(location.search, {
                ignoreQueryPrefix: true,
            });
            const current = getArray(queryParams['views']).filter(
                (item) => item.id !== id
            );
            current.push({ id, type });
            history.replace(
                location.pathname +
                    stringify(
                        { views: current },
                        { arrayFormat: 'repeat', addQueryPrefix: true }
                    )
            );
        },
        [location, history]
    );

    const showVoltageLevelDiagram = useCallback(
        (voltageLevelId) => {
            addToSearchParams(SvgType.VOLTAGE_LEVEL, voltageLevelId);
        },
        // Note: studyUuid and history don't change
        [addToSearchParams]
    );

    const showSubstationDiagram = useCallback(
        (substationId) => {
            addToSearchParams(SvgType.SUBSTATION, substationId);
        },
        // Note: studyUuid and history don't change
        [addToSearchParams]
    );

    const closeVoltageLevelDiagram = useCallback(
        (idsToRemove) => {
            const toRemove = new Set(
                Array.isArray(idsToRemove) ? idsToRemove : [idsToRemove]
            );
            const queryParams = parse(location.search, {
                ignoreQueryPrefix: true,
            });
            if (idsToRemove === undefined) {
                history.replace(location.pathname);
            } else {
                const views = getArray(queryParams['views']).filter(
                    ({ id }) => !toRemove.has(id)
                );
                history.replace(
                    location.pathname +
                        stringify(
                            { views },
                            {
                                addQueryPrefix: true,
                                arrayFormat: 'repeat',
                            }
                        ).toString()
                );
            }
        },
        [history, location]
    );

    return [
        closeVoltageLevelDiagram,
        showVoltageLevelDiagram,
        showSubstationDiagram,
    ];
};
