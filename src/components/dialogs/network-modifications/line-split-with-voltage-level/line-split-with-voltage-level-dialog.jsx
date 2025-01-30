/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, useSnackMessage, MODIFICATION_TYPES } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    BUS_OR_BUSBAR_SECTION,
    CONNECTIVITY,
    ID,
    LINE1_ID,
    LINE1_NAME,
    LINE2_ID,
    LINE2_NAME,
    LINE_TO_ATTACH_OR_SPLIT_ID,
    SLIDER_PERCENTAGE,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../dialog-utils';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../commons/modificationDialog';
import {
    getConnectivityData,
    getConnectivityWithoutPositionEmptyFormData,
    getConnectivityWithoutPositionValidationSchema,
    getNewVoltageLevelData,
} from '../../connectivity/connectivity-form-utils';
import LineSplitWithVoltageLevelForm from './line-split-with-voltage-level-form';
import LineSplitWithVoltageLevelIllustration from './line-split-with-voltage-level-illustration';
import {
    getLineToAttachOrSplitEmptyFormData,
    getLineToAttachOrSplitFormData,
    getLineToAttachOrSplitFormValidationSchema,
} from '../line-to-attach-or-split-form/line-to-attach-or-split-utils';
import { buildNewBusbarSections } from 'components/utils/utils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { divideLine } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import { fetchVoltageLevelsListInfos } from '../../../../services/study/network';
import { getNewVoltageLevelOptions } from '../../../utils/utils';

const emptyFormData = {
    [LINE1_ID]: '',
    [LINE1_NAME]: '',
    [LINE2_ID]: '',
    [LINE2_NAME]: '',
    ...getLineToAttachOrSplitEmptyFormData(),
    ...getConnectivityWithoutPositionEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [LINE1_ID]: yup.string().required(),
        [LINE1_NAME]: yup.string(),
        [LINE2_ID]: yup.string().required(),
        [LINE2_NAME]: yup.string(),
        ...getLineToAttachOrSplitFormValidationSchema(),
        ...getConnectivityWithoutPositionValidationSchema(),
    })
    .required();

/**
 * Dialog to create line split with voltage level in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LineSplitWithVoltageLevelDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const [voltageLevelOptions, setVoltageLevelOptions] = useState([]);

    const currentNodeUuid = currentNode?.id;

    const [newVoltageLevel, setNewVoltageLevel] = useState(null);

    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (lineSplit) => {
            let formData = {
                [LINE1_ID]: lineSplit.newLine1Id,
                [LINE1_NAME]: lineSplit.newLine1Name,
                [LINE2_ID]: lineSplit.newLine2Id,
                [LINE2_NAME]: lineSplit.newLine2Name,
                ...getLineToAttachOrSplitFormData({
                    lineToAttachOrSplitId: lineSplit.lineToSplitId,
                    percent: lineSplit.percent,
                }),
                ...getConnectivityData({
                    busbarSectionId: lineSplit.bbsOrBusId,
                    voltageLevelId:
                        lineSplit?.existingVoltageLevelId ?? lineSplit?.mayNewVoltageLevelInfos?.equipmentId,
                }),
            };
            const newVoltageLevel = lineSplit?.mayNewVoltageLevelInfos;
            if (newVoltageLevel) {
                formData = {
                    ...formData,
                    [CONNECTIVITY]: {
                        ...formData[CONNECTIVITY],
                        [VOLTAGE_LEVEL]: getNewVoltageLevelData(newVoltageLevel),
                    },
                };
            }
            reset(formData);
            if (newVoltageLevel) {
                newVoltageLevel.busbarSections = buildNewBusbarSections(
                    newVoltageLevel?.equipmentId,
                    newVoltageLevel?.sectionCount,
                    newVoltageLevel?.busbarCount
                );
                setNewVoltageLevel(newVoltageLevel);
            }
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (lineSplit) => {
            const currentVoltageLevelId = lineSplit[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID];
            const isNewVoltageLevel = newVoltageLevel?.equipmentId === currentVoltageLevelId;
            divideLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                lineToSplitId: lineSplit[LINE_TO_ATTACH_OR_SPLIT_ID],
                percent: parseFloat(lineSplit[SLIDER_PERCENTAGE]),
                mayNewVoltageLevelInfos: isNewVoltageLevel ? newVoltageLevel : null,
                existingVoltageLevelId: currentVoltageLevelId,
                bbsOrBusId: lineSplit[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                newLine1Id: lineSplit[LINE1_ID],
                newLine1Name: sanitizeString(lineSplit[LINE1_NAME]),
                newLine2Id: lineSplit[LINE2_ID],
                newLine2Name: sanitizeString(lineSplit[LINE2_NAME]),
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LineDivisionError',
                });
            });
        },
        [currentNodeUuid, editData, newVoltageLevel, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    useEffect(() => {
        if (studyUuid && currentNode?.id) {
            fetchVoltageLevelsListInfos(studyUuid, currentNode?.id, currentRootNetworkUuid).then((values) => {
                setVoltageLevelOptions(values.sort((a, b) => a?.id?.localeCompare(b?.id)));
            });
        }
    }, [studyUuid, currentNode?.id, currentRootNetworkUuid]);

    const onVoltageLevelCreationDo = useCallback(
        ({
            voltageLevelId,
            voltageLevelName,
            substationId,
            nominalV,
            lowVoltageLimit,
            highVoltageLimit,
            ipMin,
            ipMax,
            busbarCount,
            sectionCount,
            switchKinds,
            couplingDevices,
            topologyKind,
        }) => {
            return new Promise(() => {
                const preparedVoltageLevel = {
                    type: MODIFICATION_TYPES.VOLTAGE_LEVEL_CREATION.type,
                    equipmentId: voltageLevelId,
                    equipmentName: voltageLevelName,
                    substationId: substationId,
                    nominalV: nominalV,
                    lowVoltageLimit: lowVoltageLimit,
                    highVoltageLimit: highVoltageLimit,
                    ipMin: ipMin,
                    ipMax: ipMax,
                    busbarCount: busbarCount,
                    sectionCount: sectionCount,
                    switchKinds: switchKinds,
                    couplingDevices: couplingDevices,
                    topologyKind: topologyKind,
                };
                preparedVoltageLevel.busbarSections = buildNewBusbarSections(
                    preparedVoltageLevel.equipmentId,
                    preparedVoltageLevel.sectionCount,
                    preparedVoltageLevel.busbarCount
                );
                // we keep the old voltage level id, so it can be removed for from voltage level options
                const oldVoltageLevelId = newVoltageLevel?.equipmentId;

                const formattedVoltageLevel = getNewVoltageLevelData(preparedVoltageLevel);

                // we add the new voltage level, (or replace it if it exists). And we remove the old id if it is different (in case we modify the id)
                const newVoltageLevelOptions = getNewVoltageLevelOptions(
                    formattedVoltageLevel,
                    oldVoltageLevelId,
                    voltageLevelOptions
                );

                setVoltageLevelOptions(newVoltageLevelOptions);
                setNewVoltageLevel(preparedVoltageLevel);
                setValue(
                    `${CONNECTIVITY}.${VOLTAGE_LEVEL}`,
                    {
                        [ID]: preparedVoltageLevel.equipmentId,
                    },
                    {
                        shouldValidate: true,
                        shouldDirty: true,
                    }
                );
            });
        },
        [setValue, newVoltageLevel, voltageLevelOptions]
    );

    const onVoltageLevelChange = useCallback(() => {
        const currentVoltageLevelId = getValues(`${CONNECTIVITY}.${VOLTAGE_LEVEL}.${ID}`);
        if (newVoltageLevel && currentVoltageLevelId !== newVoltageLevel?.equipmentId) {
            setNewVoltageLevel(null);
        }
    }, [getValues, newVoltageLevel]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-voltage-level-amidst-a-line"
                titleId="LineSplitWithVoltageLevel"
                subtitle={<LineSplitWithVoltageLevelIllustration />}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <LineSplitWithVoltageLevelForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    onVoltageLevelCreationDo={onVoltageLevelCreationDo}
                    voltageLevelToEdit={newVoltageLevel}
                    onVoltageLevelChange={onVoltageLevelChange}
                    allVoltageLevelOptions={voltageLevelOptions}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

LineSplitWithVoltageLevelDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default LineSplitWithVoltageLevelDialog;
