/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NotificationType, StudyUpdated } from '../../../../redux/reducer';
import { ComputingType, isValidComputingType } from '../../../computing-status/computing-type';

export const UPDATE_TYPE_HEADER = 'updateType';
export const COMPUTATION_TYPE_HEADER = 'computationType';

export const isComputationParametersUpdated = (type: ComputingType, studyUpdated: StudyUpdated) => {
    return (
        studyUpdated.eventData.headers &&
        studyUpdated.eventData.headers[UPDATE_TYPE_HEADER] === NotificationType.COMPUTATION_PARAMETERS_UPDATED &&
        isValidComputingType(studyUpdated.eventData.headers[COMPUTATION_TYPE_HEADER]) &&
        studyUpdated.eventData.headers[COMPUTATION_TYPE_HEADER] === type
    );
};
