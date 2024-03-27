import { useComputingStatus } from '../components/computing-status/use-computing-status';
import {
    cloneVoltageInitModifications,
    fetchVoltageInitStatus,
    getVoltageInitStudyParameters,
} from '../services/study/voltage-init';
import RunningStatus, {
    getVoltageInitRunningStatus,
} from '../components/utils/running-status';
import { UUID } from 'crypto';
import { useOptionalServiceStatus } from './use-optional-service-status';
import { OptionalServicesNames } from '../components/utils/optional-services';
import ComputingType from '../components/computing-status/computing-type';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ReduxState } from '../redux/reducer.type';
import { useSnackMessage } from '@gridsuite/commons-ui';

const voltageInitStatusInvalidations = [
    'voltageInit_status',
    'voltageInit_failed',
];

const voltageInitStatusCompletions = [
    'voltageInitResult',
    'voltageInit_failed',
];

export const useVoltageInitComputingStatus = (
    studyUuid: UUID,
    currentNodeUuid: UUID
) => {
    const { snackError } = useSnackMessage();

    const voltageInitAvailability = useOptionalServiceStatus(
        OptionalServicesNames.VoltageInit
    );

    const voltageInitStatus = useSelector(
        (state: ReduxState) => state.computingStatus[ComputingType.VOLTAGE_INIT]
    );

    useComputingStatus(
        studyUuid,
        currentNodeUuid,
        fetchVoltageInitStatus,
        voltageInitStatusInvalidations,
        voltageInitStatusCompletions,
        getVoltageInitRunningStatus,
        ComputingType.VOLTAGE_INIT,
        voltageInitAvailability
    );

    // TODO: This should not be here but really catch a message
    useEffect(() => {
        if (voltageInitStatus === RunningStatus.SUCCEED) {
            getVoltageInitStudyParameters(studyUuid)
                .then((params) => {
                    if (params.applyModifications) {
                        cloneVoltageInitModifications(
                            studyUuid,
                            currentNodeUuid
                        ).catch((error) => {
                            if (error.status === 404) {
                                console.warn(
                                    `Failed to apply voltage init modifications for study ${studyUuid} and node ${currentNodeUuid}, it was probably already applied.`
                                );
                                return;
                            }
                            snackError({
                                messageTxt: error.message,
                                headerId: 'errCloneVoltageInitModificationMsg',
                            });
                        });
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'paramsRetrievingError',
                    });
                });
        }
    }, [studyUuid, currentNodeUuid, voltageInitStatus, snackError]);
};
