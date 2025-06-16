/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
    ComputingType,
    isValidComputingType,
    OptionalServicesStatus,
    UseParametersBackendReturnProps,
} from '@gridsuite/commons-ui';
import { AppState, StudyUpdated } from '../../../redux/reducer';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
    ComputationParametersUpdatedEventData,
    isComputationParametersUpdatedNotification,
} from 'types/notification-types';

export const haveComputationParametersChanged = (
    type: ComputingType,
    computationParametersUpdatedEventData: ComputationParametersUpdatedEventData
) => {
    return (
        computationParametersUpdatedEventData.headers &&
        isValidComputingType(computationParametersUpdatedEventData.headers.computationType) &&
        computationParametersUpdatedEventData.headers.computationType === type
    );
};

export const isComputationParametersUpdated = (type: ComputingType, studyUpdated: StudyUpdated) => {
    const studyUpdatedEventData = studyUpdated?.eventData;
    if (isComputationParametersUpdatedNotification(studyUpdatedEventData)) {
        return haveComputationParametersChanged(type, studyUpdatedEventData);
    }
    return false;
};

export const useParametersNotification = <T extends ComputingType>(
    type: T,
    optionalServiceStatus: OptionalServicesStatus | undefined,
    parametersBackend: UseParametersBackendReturnProps<T>
) => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const studyUpdated = useSelector((state: AppState) => state.studyUpdated);
    const optionalServiceStatusRef = useRef(optionalServiceStatus);
    optionalServiceStatusRef.current = optionalServiceStatus;
    const [, , fetchProvider, , , , fetchParameters, , , ,] = parametersBackend;

    // we need to fetch provider when ever a computationParametersUpdated notification received.
    // use optionalServiceStatusRef here to avoid double effects proc
    // other dependencies don't change this much
    useEffect(() => {
        if (
            studyUpdated &&
            isComputationParametersUpdated(type, studyUpdated) &&
            studyUuid &&
            optionalServiceStatusRef.current === OptionalServicesStatus.Up
        ) {
            fetchProvider(studyUuid);
        }
    }, [fetchProvider, studyUpdated, studyUuid, type]);

    // we need to fetch parameters when ever a computationParametersUpdated notification received.
    // use optionalServiceStatusRef here to avoid double effects proc
    // other dependencies don't change this much
    useEffect(() => {
        if (
            studyUpdated &&
            isComputationParametersUpdated(type, studyUpdated) &&
            studyUuid &&
            optionalServiceStatusRef.current === OptionalServicesStatus.Up
        ) {
            fetchParameters(studyUuid);
        }
    }, [fetchParameters, studyUuid, type, studyUpdated]);
};
