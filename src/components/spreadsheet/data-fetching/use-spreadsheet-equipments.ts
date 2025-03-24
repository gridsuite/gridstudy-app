/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { AppState } from 'redux/reducer';
import { useFetchEquipment } from './use-fetch-equipment';

export const useSpreadsheetEquipments = (tabUuid: UUID | null) => {
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const type = useSelector((state: AppState) => state.tables.definitions.find((el) => el.uuid === tabUuid)?.type);

    const [isFetching, setIsFetching] = useState<boolean>();

    const { fetchNodesEquipmentData } = useFetchEquipment(type);

    const fetch = useCallback(() => {
        setIsFetching(true);
        const nodesIds = currentNode?.id ? [currentNode?.id] : [];

        return (
            fetchNodesEquipmentData &&
            fetchNodesEquipmentData(new Set(nodesIds))?.then((eq) => {
                setIsFetching(false);
                return eq;
            })
        );
    }, [currentNode?.id, fetchNodesEquipmentData]);

    return { isFetching, fetch };
};
