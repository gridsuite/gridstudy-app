/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo } from 'react';
import { Equipment, EquipmentType, getEquipmentsInfosForSearchBar, useElementSearch } from '@gridsuite/commons-ui';
import useNameOrId from '../utils/use-name-or-id';
import { searchEquipmentsInfos } from '../../services/study';
import { UUID } from 'crypto';

interface UseSearchMatchingEquipmentsProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    inUpstreamBuiltParentNode?: boolean;
    equipmentType?: EquipmentType;
}

export const useSearchMatchingEquipments = (props: UseSearchMatchingEquipmentsProps) => {
    const { studyUuid, nodeUuid, inUpstreamBuiltParentNode, equipmentType } = props;

    const { getUseNameParameterKey, getNameOrId } = useNameOrId();

    const fetchElements: (newSearchTerm: string) => Promise<Equipment[]> = useCallback(
        (newSearchTerm) =>
            searchEquipmentsInfos(
                studyUuid,
                nodeUuid,
                newSearchTerm,
                getUseNameParameterKey,
                inUpstreamBuiltParentNode,
                equipmentType
            ),
        [equipmentType, getUseNameParameterKey, inUpstreamBuiltParentNode, nodeUuid, studyUuid]
    );

    const { elementsFound, isLoading, searchTerm, updateSearchTerm } = useElementSearch({
        fetchElements,
    });

    const equipmentsFound = useMemo(
        // @ts-expect-error TS2345: manage null string with getNameOrId
        () => getEquipmentsInfosForSearchBar(elementsFound, getNameOrId),
        [elementsFound, getNameOrId]
    );

    useEffect(() => {
        updateSearchTerm(searchTerm);
    }, [searchTerm, equipmentType, updateSearchTerm]);

    return {
        searchTerm,
        updateSearchTerm,
        equipmentsFound,
        isLoading,
    };
};
