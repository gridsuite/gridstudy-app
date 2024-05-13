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
    useSnackMessage,
    useDebounce,
    Equipment,
} from '@gridsuite/commons-ui';
import { SEARCH_FETCH_TIMEOUT_MILLIS } from '../../utils/UIconstants';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { searchEquipmentsInfos } from '../../services/study';
import { UUID } from 'crypto';

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
    const [isLoading, setIsLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [equipmentsFound, setEquipmentsFound] = useState<EquipmentInfos[]>(
        []
    );
    const lastSearchTermRef = useRef('');
    const { getUseNameParameterKey, getNameOrId } = useNameOrId();

    const searchMatchingEquipments = useCallback(
        (newSearchTerm: string) => {
            if (newSearchTerm.length === 0) {
                setEquipmentsFound([]);
                setIsLoading(false);
                return;
            }

            lastSearchTermRef.current = newSearchTerm;
            searchEquipmentsInfos(
                studyUuid,
                nodeUuid,
                newSearchTerm,
                getUseNameParameterKey,
                inUpstreamBuiltParentNode,
                equipmentType
            )
                .then((infos) => {
                    if (newSearchTerm === lastSearchTermRef.current) {
                        setEquipmentsFound(makeItems(infos, getNameOrId));
                        setIsLoading(false);
                    } // else ignore results of outdated fetch
                })
                .catch((error) => {
                    if (newSearchTerm === lastSearchTermRef.current) {
                        setIsLoading(false);
                    } // else ignore errors of outdated fetch if changing "isLoading state"
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

    const updateSearchTerm = useCallback(
        (newSearchTerm: string) => {
            setSearchTerm(newSearchTerm);
            // if user input is empty, return empty array and set isLoading to false without debouncing
            if (newSearchTerm.length === 0) {
                setEquipmentsFound([]);
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            debouncedSearchMatchingEquipments(newSearchTerm);
        },
        [debouncedSearchMatchingEquipments]
    );

    useEffect(() => {
        setEquipmentsFound([]);
    }, [equipmentType]);

    return { searchTerm, updateSearchTerm, equipmentsFound, isLoading };
};
