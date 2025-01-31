/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    ATTACHED_LINE_ID,
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
import DeleteAttachingLineForm from './delete-attaching-line-form';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { deleteAttachingLine } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../services/utils';
import DeleteAttachingLineIllustration from './delete-attaching-line-illustration';

const emptyFormData = {
    [ATTACHED_LINE_ID]: null,
    [LINE_TO_ATTACH_TO_1_ID]: null,
    [LINE_TO_ATTACH_TO_2_ID]: null,
    [REPLACING_LINE_1_ID]: '',
    [REPLACING_LINE_1_NAME]: '',
};

const formSchema = yup
    .object()
    .shape({
        [ATTACHED_LINE_ID]: yup.string().nullable().required(),
        [LINE_TO_ATTACH_TO_1_ID]: yup.string().nullable().required(),
        [LINE_TO_ATTACH_TO_2_ID]: yup.string().nullable().required(),
        [REPLACING_LINE_1_ID]: yup.string().required(),
        [REPLACING_LINE_1_NAME]: yup.string(),
    })
    .required();

/**
 * Dialog to delete attaching line.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param currentRootNetworkUuid The root network uuid we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const DeleteAttachingLineDialog = ({
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
                [ATTACHED_LINE_ID]: editData.attachedLineId,
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
            deleteAttachingLine({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData ? editData.uuid : undefined,
                lineToAttachTo1Id: formData[LINE_TO_ATTACH_TO_1_ID],
                lineToAttachTo2Id: formData[LINE_TO_ATTACH_TO_2_ID],
                attachedLineId: formData[ATTACHED_LINE_ID],
                replacingLine1Id: formData[REPLACING_LINE_1_ID],
                replacingLine1Name: sanitizeString(formData[REPLACING_LINE_1_NAME]),
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'DeleteAttachingLineError',
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
                subtitle={<DeleteAttachingLineIllustration />}
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-delete-attaching-line"
                titleId="DeleteAttachingLine"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <DeleteAttachingLineForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

DeleteAttachingLineDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    currentRootNetworkUuid: PropTypes.string,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default DeleteAttachingLineDialog;
