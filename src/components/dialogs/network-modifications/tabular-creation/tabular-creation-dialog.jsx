/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { CREATIONS_TABLE, REACTIVE_CAPABILITY_CURVE, TYPE } from 'components/utils/field-constants';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';
import { createTabularCreation } from 'services/study/network-modifications';
import { FetchStatus } from 'services/utils';
import TabularCreationForm from './tabular-creation-form';
import {
    convertCreationFieldFromBackToFront,
    convertCreationFieldFromFrontToBack,
    getEquipmentTypeFromCreationType,
    TABULAR_CREATION_TYPES,
} from './tabular-creation-utils';
import { useIntl } from 'react-intl';
import { formatModification } from '../tabular-modification/tabular-modification-utils';

const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.string().nullable().required(),
        [CREATIONS_TABLE]: yup.array().min(1, 'CreationsRequiredTabError').required(),
    })
    .required();

const emptyFormData = {
    [TYPE]: null,
    [CREATIONS_TABLE]: [],
};

/**
 * Dialog to create tabular creations based on a csv file.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const TabularCreationDialog = ({ studyUuid, currentNode, editData, isUpdate, editDataFetchStatus, ...dialogProps }) => {
    const currentNodeUuid = currentNode?.id;

    const intl = useIntl();

    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const {
        reset,
        formState: { errors },
    } = formMethods;

    const disableSave = Object.keys(errors).length > 0;

    useEffect(() => {
        if (editData) {
            const equipmentType = getEquipmentTypeFromCreationType(editData?.creationType);
            const creations = editData?.creations.map((creat) => {
                const creation = {};
                Object.keys(formatModification(creat)).forEach((key) => {
                    const entry = convertCreationFieldFromBackToFront(key, creat[key]);
                    creation[entry.key] = entry.value;
                });
                return creation;
            });
            reset({
                [TYPE]: equipmentType,
                [CREATIONS_TABLE]: creations,
            });
        }
    }, [editData, reset, intl]);

    const onSubmit = useCallback(
        (formData) => {
            const creationType = TABULAR_CREATION_TYPES[formData[TYPE]];
            const creations = formData[CREATIONS_TABLE]?.map((row) => {
                const creation = {
                    type: creationType,
                };
                Object.keys(row).forEach((key) => {
                    const entry = convertCreationFieldFromFrontToBack(key, row[key]);
                    creation[entry.key] = entry.value;
                });
                // For now, we do not manage reactive limits by diagram
                if (creationType === 'GENERATOR_CREATION') {
                    creation[REACTIVE_CAPABILITY_CURVE] = false;
                }
                return creation;
            });
            createTabularCreation(
                studyUuid,
                currentNodeUuid,
                creationType,
                creations,
                !!editData,
                editData?.uuid
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'TabularCreationError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'lg'}
                onClear={clear}
                disabledSave={disableSave}
                onSave={onSubmit}
                aria-labelledby="dialog-tabular-creation"
                titleId="TabularCreation"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <TabularCreationForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

TabularCreationDialog.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    editData: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default TabularCreationDialog;
