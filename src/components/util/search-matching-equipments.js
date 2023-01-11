/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { searchEquipmentsInfos } from '../../utils/rest-api';
import { getEquipmentsInfosForSearchBar } from '@gridsuite/commons-ui';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { SEARCH_FETCH_TIMEOUT_MILLIS } from '../../utils/UIconstants';
import { useNameOrId } from './equipmentInfosHandler';

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
    const { getUseNameParameterKey, getNameOrId } = useNameOrId();

    const searchMatchingEquipments = useCallback(
        (searchTerm, sooner = false) => {
            clearTimeout(timer.current);

            timer.current = setTimeout(
                () => {
                    lastSearchTermRef.current = searchTerm;
                    searchEquipmentsInfos(
                        studyUuid,
                        nodeUuid,
                        searchTerm,
                        getUseNameParameterKey,
                        inUpstreamBuiltParentNode,
                        equipmentType
                    )
                        .then((infos) => {
                            if (searchTerm === lastSearchTermRef.current) {
                                setEquipmentsFound(
                                    makeItems(infos, getNameOrId)
                                );
                            } // else ignore results of outdated fetch
                        })
                        .catch((error) => {
                            snackError({
                                messageTxt: error.message,
                                headerId: 'equipmentsSearchingError',
                            });
                        });
                },
                sooner ? 10 : SEARCH_FETCH_TIMEOUT_MILLIS
            );
        },
        [
            studyUuid,
            nodeUuid,
            equipmentType,
            inUpstreamBuiltParentNode,
            makeItems,
            snackError,
            getNameOrId,
            getUseNameParameterKey,
        ]
    );

    useEffect(() => {
        setEquipmentsFound([]);
    }, [equipmentType]);

    return [searchMatchingEquipments, equipmentsFound];
};
