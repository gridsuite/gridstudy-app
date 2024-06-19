/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useMemo } from 'react';
import {
    EquipmentType,
    getEquipmentsInfosForSearchBar,
    useElementSearch,
} from '@gridsuite/commons-ui';
import { useNameOrId } from '../utils/equipmentInfosHandler';
import { searchEquipmentsInfos } from '../../services/study';
import { UUID } from 'crypto';
import { Equipment } from '@gridsuite/commons-ui/dist/utils/EquipmentType';

interface UseSearchMatchingEquipmentsProps {
    studyUuid: UUID;
    nodeUuid: UUID;
    inUpstreamBuiltParentNode?: boolean;
    equipmentType?: EquipmentType;
}

export const useSearchMatchingEquipments = (
    props: UseSearchMatchingEquipmentsProps
) => {
    const { studyUuid, nodeUuid, inUpstreamBuiltParentNode, equipmentType } =
        props;

    const { getUseNameParameterKey, getNameOrId } = useNameOrId();

    const fetchElements: (newSearchTerm: string) => Promise<Equipment[]> =
        useCallback(
            (newSearchTerm) =>
                searchEquipmentsInfos(
                    studyUuid,
                    nodeUuid,
                    newSearchTerm,
                    getUseNameParameterKey,
                    inUpstreamBuiltParentNode,
                    equipmentType
                ),
            [
                equipmentType,
                getUseNameParameterKey,
                inUpstreamBuiltParentNode,
                nodeUuid,
                studyUuid,
            ]
        );

    const { elementsFound, isLoading, searchTerm, updateSearchTerm } =
        useElementSearch({
            fetchElements,
        });

    const equipmentsFound = useMemo(
        () => getEquipmentsInfosForSearchBar(elementsFound, getNameOrId),
        [elementsFound, getNameOrId]
    );

    useEffect(() => {
        updateSearchTerm('');
    }, [equipmentType, updateSearchTerm]);

    return {
        searchTerm,
        updateSearchTerm,
        equipmentsFound,
        isLoading,
    };
};
