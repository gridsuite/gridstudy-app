import { NotificationType, StudyUpdated } from '../../../../redux/reducer';
import ComputationType, { isValidComputationType } from '../../../computing-status/computation-type';

export const UPDATE_TYPE_HEADER = 'updateType';
export const COMPUTATION_TYPE_HEADER = 'computationType';

export const isComputationParametersUpdated = (type: ComputationType, studyUpdated: StudyUpdated) => {
    return (
        studyUpdated.eventData.headers &&
        studyUpdated.eventData.headers[UPDATE_TYPE_HEADER] === NotificationType.COMPUTATION_PARAMETERS_UPDATED &&
        isValidComputationType(studyUpdated.eventData.headers[COMPUTATION_TYPE_HEADER]) &&
        studyUpdated.eventData.headers[COMPUTATION_TYPE_HEADER] === type
    );
};
