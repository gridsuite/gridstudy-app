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
import { AppState, NotificationType, StudyUpdated, StudyUpdatedEventData } from '../../../redux/reducer';
import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

export const haveComputationParametersChanged = (type: ComputingType, studyUpdatedEventData: StudyUpdatedEventData) => {
    return (
        studyUpdatedEventData.headers &&
        studyUpdatedEventData.headers.updateType === NotificationType.COMPUTATION_PARAMETERS_UPDATED &&
        studyUpdatedEventData.headers.computationType === type &&
        isValidComputingType(studyUpdatedEventData.headers.computationType)
    );
};

export const isComputationParametersUpdated = (type: ComputingType, studyUpdated: StudyUpdated) => {
    const studyUpdatedEventData = studyUpdated?.eventData as StudyUpdatedEventData;
    return haveComputationParametersChanged(type, studyUpdatedEventData);
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
