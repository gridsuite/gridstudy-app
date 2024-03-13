/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    mapEquipmentsCreated,
    setMapEquipementsInitialized,
} from '../../redux/actions';
import {
    fetchHvdcLinesMapInfos,
    fetchLinesMapInfos,
    fetchSubstationsMapInfos,
} from '../../services/study/network';
import { MapEquipments } from '@powsybl/diagram-viewer';

export default class GSMapEquipments extends MapEquipments {
    initEquipments(studyUuid, currentNodeUuid) {
        const fetchSubstationsMapInfosPromise = fetchSubstationsMapInfos(
            studyUuid,
            currentNodeUuid,
            undefined,
            false,
        );
        const fetchLinesMapInfosPromise = fetchLinesMapInfos(
            studyUuid,
            currentNodeUuid,
            undefined,
            false,
        );
        const fetchHvdcLinesMapInfosPromise = fetchHvdcLinesMapInfos(
            studyUuid,
            currentNodeUuid,
            undefined,
            false,
        );

        this.dispatch(setMapEquipementsInitialized(false));

        fetchSubstationsMapInfosPromise
            .then((val) => {
                this.dispatch(
                    mapEquipmentsCreated(this, undefined, val, undefined),
                );
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
                this.dispatch(
                    mapEquipmentsCreated(this, val, undefined, undefined),
                );
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
                this.dispatch(
                    mapEquipmentsCreated(this, undefined, undefined, val),
                );
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
            fetchHvdcLinesMapInfosPromise,
        ]).finally(() => {
            this.dispatch(setMapEquipementsInitialized(true));
        });
    }

    constructor(studyUuid, currentNodeUuid, errHandler, dispatch, intlRef) {
        super();
        this.dispatch = dispatch;
        this.errHandler = errHandler;
        this.intlRef = intlRef;
        this.initEquipments(studyUuid, currentNodeUuid);
    }

    reloadImpactedSubstationsEquipments(
        studyUuid,
        currentNode,
        substationsIds,
    ) {
        const updatedSubstations = fetchSubstationsMapInfos(
            studyUuid,
            currentNode?.id,
            substationsIds,
            true,
        );
        const updatedLines = fetchLinesMapInfos(
            studyUuid,
            currentNode?.id,
            substationsIds,
            true,
        );
        const updatedHvdcLines = fetchHvdcLinesMapInfos(
            studyUuid,
            currentNode?.id,
            substationsIds,
            true,
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
        updatedHvdcLines.catch((error) => {
            console.error(error.message);
            if (this.errHandler) {
                this.errHandler({
                    messageTxt: error.message,
                    headerId: 'MapEquipmentsLoadError',
                });
            }
        });
        return [updatedSubstations, updatedLines, updatedHvdcLines];
    }
}
