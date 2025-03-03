/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo } from 'react';
import {
    Equipment,
    EquipmentType,
    ExtendedEquipmentType,
    getEquipmentsInfosForSearchBar,
    useElementSearch,
} from '@gridsuite/commons-ui';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { searchEquipmentsInfos } from '../../services/study';
import { UUID } from 'crypto';

interface UseSearchMatchingEquipmentsProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
    inUpstreamBuiltParentNode?: boolean;
    equipmentType?: EquipmentType | ExtendedEquipmentType;
}

export const useSearchMatchingEquipments = (props: UseSearchMatchingEquipmentsProps) => {
    const { studyUuid, nodeUuid, currentRootNetworkUuid, inUpstreamBuiltParentNode, equipmentType } = props;

    const { getUseNameParameterKey, getNameOrId } = useNameOrId();

    const fetchElements: (newSearchTerm: string) => Promise<Equipment[]> = useCallback(
        (newSearchTerm) =>
            searchEquipmentsInfos(
                studyUuid,
                nodeUuid,
                currentRootNetworkUuid,
                newSearchTerm,
                getUseNameParameterKey,
                inUpstreamBuiltParentNode,
                equipmentType
            ),
        [equipmentType, getUseNameParameterKey, inUpstreamBuiltParentNode, nodeUuid, studyUuid, currentRootNetworkUuid]
    );

    const { elementsFound, isLoading, searchTerm, updateSearchTerm } = useElementSearch({
        fetchElements,
    });

    const equipmentsFound = useMemo(
        () => getEquipmentsInfosForSearchBar(elementsFound, getNameOrId),
        [elementsFound, getNameOrId]
    );

    useEffect(() => {
        updateSearchTerm(searchTerm?.trim());
    }, [searchTerm, equipmentType, updateSearchTerm]);

    return {
        searchTerm,
        updateSearchTerm,
        equipmentsFound,
        isLoading,
    };
};
