/*
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import { fetchEquipmentsInfos } from '../../utils/rest-api';
import { getEquipmentsInfosForSearchBar } from '@gridsuite/commons-ui';
import { useSnackMessage } from '../../utils/messages';
import { useSelector } from 'react-redux';
import { PARAM_USE_NAME } from '../../utils/config-params';

export const useSearchMatchingEquipments = (
    studyUuid,
    nodeUuid,
    lastSearchTermRef,
    inUpstreamBuiltParentNode,
    equipmentType
) => {
    const { snackError } = useSnackMessage();
    const useNameLocal = useSelector((state) => state[PARAM_USE_NAME]);
    const [equipmentsFound, setEquipmentsFound] = useState([]);

    const searchMatchingEquipments = useCallback(
        (searchTerm) => {
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
                            getEquipmentsInfosForSearchBar(infos, useNameLocal)
                        );
                    } // else ignore results of outdated fetch
                })
                .catch((errorMessage) =>
                    snackError(errorMessage, 'equipmentsSearchingError')
                );
        },
        [
            studyUuid,
            nodeUuid,
            useNameLocal,
            equipmentType,
            inUpstreamBuiltParentNode,
            lastSearchTermRef,
            snackError,
        ]
    );

    return [searchMatchingEquipments, equipmentsFound];
};
