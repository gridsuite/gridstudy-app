/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { UUID } from 'crypto';
import { type UseSnackMessageReturn } from '@gridsuite/commons-ui';
import { MapEquipments } from '@powsybl/network-viewer';
import { mapEquipmentsCreated, setMapEquipementsInitialized } from '../../redux/actions';
import type { AppDispatch } from '../../redux/store';
import {
    fetchHvdcLinesMapInfos,
    fetchLinesMapInfos,
    fetchSubstationsMapInfos,
    fetchTieLinesMapInfos,
} from '../../services/study/network';

export default class GSMapEquipments extends MapEquipments {
    dispatch: AppDispatch;
    errHandler?: UseSnackMessageReturn['snackError'];

    initEquipments(studyUuid: UUID, currentNodeUuid: UUID, currentRootNetworkUuid: UUID) {
        const fetchSubstationsMapInfosPromise = fetchSubstationsMapInfos(
            studyUuid,
            currentNodeUuid,
            currentRootNetworkUuid,
            undefined,
            false
        );
        const fetchLinesMapInfosPromise = fetchLinesMapInfos(
            studyUuid,
            currentNodeUuid,
            currentRootNetworkUuid,
            undefined,
            false
        );
        const fetchTieLinesMapInfosPromise = fetchTieLinesMapInfos(
            studyUuid,
            currentNodeUuid,
            currentRootNetworkUuid,
            undefined,
            false
        );
        const fetchHvdcLinesMapInfosPromise = fetchHvdcLinesMapInfos(
            studyUuid,
            currentNodeUuid,
            currentRootNetworkUuid,
            undefined,
            false
        );

        this.dispatch(setMapEquipementsInitialized(false));

        fetchSubstationsMapInfosPromise
            .then((val) => {
                this.dispatch(mapEquipmentsCreated(this, undefined, undefined, val, undefined));
            })
            .catch((error) => {
                console.error(error.message);
                if (this.errHandler) {
                    this.errHandler({
                        messageTxt: error.message,
                        headerId: 'MapEquipmentsLoadError',
                    });
                }
            });

        fetchLinesMapInfosPromise
            .then((val) => {
                this.dispatch(mapEquipmentsCreated(this, val, undefined, undefined, undefined));
            })
            .catch((error) => {
                console.error(error.message);
                if (this.errHandler) {
                    this.errHandler({
                        messageTxt: error.message,
                        headerId: 'MapEquipmentsLoadError',
                    });
                }
            });

        fetchTieLinesMapInfosPromise
            .then((val) => {
                this.dispatch(mapEquipmentsCreated(this, undefined, val, undefined, undefined));
            })
            .catch((error) => {
                console.error(error.message);
                if (this.errHandler) {
                    this.errHandler({
                        messageTxt: error.message,
                        headerId: 'MapEquipmentsLoadError',
                    });
                }
            });

        fetchHvdcLinesMapInfosPromise
            .then((val) => {
                this.dispatch(mapEquipmentsCreated(this, undefined, undefined, undefined, val));
            })
            .catch((error) => {
                console.error(error.message);
                if (this.errHandler) {
                    this.errHandler({
                        messageTxt: error.message,
                        headerId: 'MapEquipmentsLoadError',
                    });
                }
            });

        Promise.all([
            fetchSubstationsMapInfosPromise,
            fetchLinesMapInfosPromise,
            fetchTieLinesMapInfosPromise,
            fetchHvdcLinesMapInfosPromise,
        ]).finally(() => {
            this.dispatch(setMapEquipementsInitialized(true));
        });
    }

    constructor(
        studyUuid: UUID,
        currentNodeUuid: UUID,
        currentRootNetworkUuid: UUID,
        errHandler: UseSnackMessageReturn['snackError'],
        dispatch: AppDispatch
    ) {
        super();
        this.dispatch = dispatch;
        this.errHandler = errHandler;
        this.initEquipments(studyUuid, currentNodeUuid, currentRootNetworkUuid);
    }

    reloadImpactedSubstationsEquipments(
        studyUuid: UUID,
        currentNode: any,
        currentRootNetworkUuid: UUID,
        substationsIds: string[] | undefined
    ) {
        const updatedSubstations = fetchSubstationsMapInfos(
            studyUuid,
            currentNode?.id,
            currentRootNetworkUuid,
            substationsIds,
            true
        );
        const updatedLines = fetchLinesMapInfos(
            studyUuid,
            currentNode?.id,
            currentRootNetworkUuid,
            substationsIds,
            true
        );
        const updatedTieLines = fetchTieLinesMapInfos(
            studyUuid,
            currentNode?.id,
            currentRootNetworkUuid,
            substationsIds,
            true
        );
        const updatedHvdcLines = fetchHvdcLinesMapInfos(
            studyUuid,
            currentNode?.id,
            currentRootNetworkUuid,
            substationsIds,
            true
        );
        updatedSubstations.catch((error) => {
            console.error(error.message);
            if (this.errHandler) {
                this.errHandler({
                    messageTxt: error.message,
                    headerId: 'MapEquipmentsLoadError',
                });
            }
        });
        updatedLines.catch((error) => {
            console.error(error.message);
            if (this.errHandler) {
                this.errHandler({
                    messageTxt: error.message,
                    headerId: 'MapEquipmentsLoadError',
                });
            }
        });
        updatedTieLines.catch((error) => {
            console.error(error.message);
            if (this.errHandler) {
                this.errHandler({
                    messageTxt: error.message,
                    headerId: 'MapEquipmentsLoadError',
                });
            }
        });
        updatedHvdcLines.catch((error) => {
            console.error(error.message);
            if (this.errHandler) {
                this.errHandler({
                    messageTxt: error.message,
                    headerId: 'MapEquipmentsLoadError',
                });
            }
        });
        return { updatedSubstations, updatedLines, updatedTieLines, updatedHvdcLines };
    }
}
