/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    LINE_TO_ATTACH_TO_1_ID,
    LINE_TO_ATTACH_TO_2_ID,
    REPLACING_LINE_1_ID,
    REPLACING_LINE_1_NAME,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../dialog-utils';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../commons/modificationDialog';
import DeleteVoltageLevelOnLineForm from './delete-voltage-level-on-line-form';
import { deleteVoltageLevelOnLine } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import DeleteVoltageLevelOnLineIllustration from './delete-voltage-level-on-line-illustration';

const emptyFormData = {
    [LINE_TO_ATTACH_TO_1_ID]: null,
    [LINE_TO_ATTACH_TO_2_ID]: null,
    [REPLACING_LINE_1_ID]: '',
    [REPLACING_LINE_1_NAME]: '',
};

const formSchema = yup
    .object()
    .shape({
        [LINE_TO_ATTACH_TO_1_ID]: yup.string().nullable().required(),
        [LINE_TO_ATTACH_TO_2_ID]: yup.string().nullable().required(),
        [REPLACING_LINE_1_ID]: yup.string().required(),
        [REPLACING_LINE_1_NAME]: yup.string(),
    })
    .required();

/**
 * Dialog to delete a voltage level on a line
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const DeleteVoltageLevelOnLineDialog = ({
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const fromEditDataToFormValues = useCallback(
        (editData) => {
            reset({
                [LINE_TO_ATTACH_TO_1_ID]: editData.lineToAttachTo1Id,
                [LINE_TO_ATTACH_TO_2_ID]: editData.lineToAttachTo2Id,
                [REPLACING_LINE_1_ID]: editData.replacingLine1Id,
                [REPLACING_LINE_1_NAME]: editData.replacingLine1Name,
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (formData) => {
            deleteVoltageLevelOnLine(
                studyUuid,
                currentNodeUuid,
                editData ? editData.uuid : undefined,
                formData[LINE_TO_ATTACH_TO_1_ID],
                formData[LINE_TO_ATTACH_TO_2_ID],
                formData[REPLACING_LINE_1_ID],
                sanitizeString(formData[REPLACING_LINE_1_NAME])
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'DeleteVoltageLevelOnLineError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-delete-voltage-level-on-line"
                titleId="DeleteVoltageLevelOnLine"
                subtitle={<DeleteVoltageLevelOnLineIllustration />}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <DeleteVoltageLevelOnLineForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

DeleteVoltageLevelOnLineDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default DeleteVoltageLevelOnLineDialog;
