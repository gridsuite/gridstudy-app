/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useRef, useState } from 'react';
import { fetchEquipmentsInfos } from '../../utils/rest-api';
import { getEquipmentsInfosForSearchBar } from '@gridsuite/commons-ui';
import { useSnackMessage } from '../../utils/messages';
import { SEARCH_FETCH_TIMEOUT_MILLIS } from '../../utils/UIconstants';
import { PARAM_USE_NAME } from '../../utils/config-params';
import { useParameterState } from '../dialogs/parameters/parameters';

export const useSearchMatchingEquipments = (
    studyUuid,
    nodeUuid,
    inUpstreamBuiltParentNode,
    equipmentType,
    makeItems = getEquipmentsInfosForSearchBar
) => {
    const { snackError } = useSnackMessage();
    const [equipmentsFound, setEquipmentsFound] = useState([]);
    const timer = useRef();
    const lastSearchTermRef = useRef('');
    const [useNameLocal] = useParameterState(PARAM_USE_NAME);

    const searchMatchingEquipments = useCallback(
        (searchTerm, sooner = false) => {
            clearTimeout(timer.current);

            timer.current = setTimeout(
                () => {
                lastSearchTermRef.current = searchTerm;
                fetchEquipmentsInfos(
                    studyUuid,
                    nodeUuid,
                    searchTerm,
                    useNameLocal,
                    inUpstreamBuiltParentNode,
                    equipmentType
                )
                    .then((infos) => {
                        if (searchTerm === lastSearchTermRef.current) {
                                setEquipmentsFound(
                                    makeItems(infos, useNameLocal)
                                );
                        } // else ignore results of outdated fetch
                            timer.current = undefined;
                    })
                    .catch((errorMessage) =>
                        snackError(errorMessage, 'equipmentsSearchingError')
                    );
                },
                sooner ? 10 : SEARCH_FETCH_TIMEOUT_MILLIS
            );
        },
        [
            studyUuid,
            nodeUuid,
            useNameLocal,
            equipmentType,
            inUpstreamBuiltParentNode,
            makeItems,
            snackError,
        ]
    );

    return [searchMatchingEquipments, equipmentsFound];
};
