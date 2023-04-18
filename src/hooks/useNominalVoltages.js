/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { fetchNominalVoltages } from '../utils/rest-api';
import { useSnackMessage } from '@gridsuite/commons-ui';

export function useNominalVoltages() {
    const { snackError } = useSnackMessage();

    const studyUuid = useSelector((state) => state.studyUuid);
    const currentNode = useSelector((state) => state.currentTreeNode);

    const [nominalVoltages, setNominalVoltages] = useState([]);

    useEffect(() => {
        if (studyUuid && currentNode) {
            let ignore = false; // to manage race condition
            fetchNominalVoltages(studyUuid, currentNode.id)
                .then((data) => {
                    if (!ignore) {
                        setNominalVoltages(data);
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'fetchNominalVoltagesError',
                    });
                });
            return () => {
                ignore = true;
            };
        }
    }, [studyUuid, currentNode, snackError]);

    return nominalVoltages;
}
