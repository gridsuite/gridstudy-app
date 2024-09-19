/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { UUID } from 'crypto';
import { RefObject } from 'react';
import { IntlShape } from 'react-intl';
import { Dispatch } from 'redux';
import { UseSnackMessageReturn } from '@gridsuite/commons-ui';
import { mapEquipmentsCreated, setMapEquipementsInitialized } from '../../redux/actions';
import {
    fetchHvdcLinesMapInfos,
    fetchLinesMapInfos,
    fetchSubstationsMapInfos,
    fetchTieLinesMapInfos,
} from '../../services/study/network';
import { MapEquipments } from '@powsybl/diagram-viewer';

export default class GSMapEquipments extends MapEquipments {
    dispatch: Dispatch;
    errHandler?: UseSnackMessageReturn['snackError'];
    intlRef: RefObject<IntlShape>;

    initEquipments(studyUuid: UUID, currentNodeUuid: UUID) {
        const fetchSubstationsMapInfosPromise = fetchSubstationsMapInfos(studyUuid, currentNodeUuid, undefined, false);
        const fetchLinesMapInfosPromise = fetchLinesMapInfos(studyUuid, currentNodeUuid, undefined, false);
        const fetchTieLinesMapInfosPromise = fetchTieLinesMapInfos(studyUuid, currentNodeUuid, undefined, false);
        const fetchHvdcLinesMapInfosPromise = fetchHvdcLinesMapInfos(studyUuid, currentNodeUuid, undefined, false);

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
        errHandler: UseSnackMessageReturn['snackError'],
        dispatch: Dispatch,
        intlRef: RefObject<IntlShape>
    ) {
        super();
        this.dispatch = dispatch;
        this.errHandler = errHandler;
        this.intlRef = intlRef;
        this.initEquipments(studyUuid, currentNodeUuid);
    }

    reloadImpactedSubstationsEquipments(studyUuid: UUID, currentNode: any, substationsIds: string[]) {
        const updatedSubstations = fetchSubstationsMapInfos(studyUuid, currentNode?.id, substationsIds, true);
        const updatedLines = fetchLinesMapInfos(studyUuid, currentNode?.id, substationsIds, true);
        const updatedTieLines = fetchTieLinesMapInfos(studyUuid, currentNode?.id, substationsIds, true);
        const updatedHvdcLines = fetchHvdcLinesMapInfos(studyUuid, currentNode?.id, substationsIds, true);
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
        return [updatedSubstations, updatedLines, updatedTieLines, updatedHvdcLines];
    }
}
