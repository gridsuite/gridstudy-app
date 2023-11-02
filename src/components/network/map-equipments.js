/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { MAX_NUMBER_OF_IMPACTED_SUBSTATIONS } from './constants';
import { mapEquipmentsCreated } from '../../redux/actions';
import {
    fetchHvdcLinesMapInfos,
    fetchLinesMapInfos,
    fetchSubstationsMapInfos,
} from '../../services/study/network';
import { MapEquipmentsBase } from '@powsybl/network-map-viewer';

export default class MapEquipments extends MapEquipmentsBase {
    initEquipments(studyUuid, currentNodeUuid) {
        fetchSubstationsMapInfos(studyUuid, currentNodeUuid, undefined, false)
            .then((val) => {
                this.dispatch(
                    mapEquipmentsCreated(this, undefined, val, undefined)
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
        fetchLinesMapInfos(studyUuid, currentNodeUuid, undefined, false)
            .then((val) => {
                this.dispatch(
                    mapEquipmentsCreated(this, val, undefined, undefined)
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
        fetchHvdcLinesMapInfos(studyUuid, currentNodeUuid, undefined, false)
            .then((val) => {
                this.dispatch(
                    mapEquipmentsCreated(this, undefined, undefined, val)
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
        substationsIds
    ) {
        super.reloadImpactedSubstationsEquipments();
        const substationsIdsToFetch =
            substationsIds?.length > MAX_NUMBER_OF_IMPACTED_SUBSTATIONS
                ? undefined
                : substationsIds; // TODO : temporary to fix fetching request failing when number of impacted substations is too high

        const updatedSubstations = fetchSubstationsMapInfos(
            studyUuid,
            currentNode?.id,
            substationsIdsToFetch,
            true
        );
        const updatedLines = fetchLinesMapInfos(
            studyUuid,
            currentNode?.id,
            substationsIdsToFetch,
            true
        );
        const updatedHvdcLines = fetchHvdcLinesMapInfos(
            studyUuid,
            currentNode?.id,
            substationsIdsToFetch,
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
                this.errHandler(
                    this.intlRef.current.formatMessage({
                        id: 'MapEquipmentsLoadError',
                    })
                );
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
