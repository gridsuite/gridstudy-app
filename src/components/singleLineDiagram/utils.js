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
    return !Array.isArray(value) ? [value] : value;
}

const arrayFormat = 'indices';

export const useSingleLineDiagram = () => {
    const history = useHistory();
    const location = useLocation();

    const addToSearchParams = useCallback(
        (type, id) => {
            const queryParams = parse(location.search, {
                ignoreQueryPrefix: true,
            });
            const current = getArray(queryParams['views'])
                .filter((item) => item.id !== id)
                .map(({ id, type }) => {
                    return { id, type }; // filter to only id, type
                });
            current.push({ id, type, lastOpen: true });
            history.replace(
                location.pathname +
                    stringify(
                        { views: current },
                        { arrayFormat, addQueryPrefix: true }
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
                arrayFormat,
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
                                arrayFormat,
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
