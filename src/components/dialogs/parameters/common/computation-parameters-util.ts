/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { NotificationType, StudyUpdated } from '../../../../redux/reducer';
import { ComputingType, isValidComputingType } from '../../../computing-status/computing-type';

export const isComputationParametersUpdated = (type: ComputingType, studyUpdated: StudyUpdated) => {
    // TODO fix my type
    if (studyUpdated.type !== undefined) {
        return false;
    }

    return (
        studyUpdated.eventData.headers &&
        studyUpdated.eventData.headers.updateType === NotificationType.COMPUTATION_PARAMETERS_UPDATED &&
        isValidComputingType(studyUpdated.eventData.headers.computationType) &&
        studyUpdated.eventData.headers.computationType === type
    );
};
