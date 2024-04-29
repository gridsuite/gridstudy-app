/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
    EquipmentInfos,
    EquipmentType,
    Identifiable,
    getEquipmentsInfosForSearchBar,
} from '@gridsuite/commons-ui';
import { useSnackMessage, useDebounce } from '@gridsuite/commons-ui';
import { SEARCH_FETCH_TIMEOUT_MILLIS } from '../../utils/UIconstants';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { searchEquipmentsInfos } from '../../services/study';
import { UUID } from 'crypto';
import { Equipment } from '@gridsuite/commons-ui/dist/utils/types';

interface UseSearchMatchingEquipmentsProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    inUpstreamBuiltParentNode?: boolean;
    equipmentType?: EquipmentType;
    makeItems?: (
        equipmentsInfos: Equipment[],
        getNameOrId: (e: Identifiable) => string
    ) => EquipmentInfos[];
}

export const useSearchMatchingEquipments = (
    props: UseSearchMatchingEquipmentsProps
) => {
    const {
        studyUuid,
        nodeUuid,
        inUpstreamBuiltParentNode,
        equipmentType,
        makeItems = getEquipmentsInfosForSearchBar,
    } = props;

    const { snackError } = useSnackMessage();
    const [equipmentsFound, setEquipmentsFound] = useState<EquipmentInfos[]>(
        []
    );
    const lastSearchTermRef = useRef('');
    const { getUseNameParameterKey, getNameOrId } = useNameOrId();

    const searchMatchingEquipments = useCallback(
        (searchTerm: string) => {
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
                        setEquipmentsFound(makeItems(infos, getNameOrId));
                    } // else ignore results of outdated fetch
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'equipmentsSearchingError',
                    });
                });
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

    const debouncedSearchMatchingEquipments = useDebounce(
        searchMatchingEquipments,
        SEARCH_FETCH_TIMEOUT_MILLIS
    );

    useEffect(() => {
        setEquipmentsFound([]);
    }, [equipmentType]);

    return { debouncedSearchMatchingEquipments, equipmentsFound };
};
