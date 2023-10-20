/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { FormProvider, useForm } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { MODIFICATIONS_TABLE, TYPE } from 'components/utils/field-constants';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';
import { createTabulareModification } from 'services/study/network-modifications';
import { FetchStatus } from 'services/utils';
import TabularModificationForm from './tabular-modification-form';
import {
    TABULAR_MODIFICATION_FIELDS,
    TABULAR_MODIFICATION_TYPES,
    formatModification,
    getEquipmentTypeFromModificationType,
} from './tabular-modification-utils';
import { toModificationOperation } from 'components/utils/utils';
import { useIntl } from 'react-intl';

const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.string().nullable().required(),
    })
    .required();

const emptyFormData = {
    [TYPE]: null,
    [MODIFICATIONS_TABLE]: [],
};

/**
 * Dialog to create tabular modification based on a csv file.
 * @param studyUuid the study we are currently working on
 * @param currentNode the node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const TabularModificationDialog = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const intl = useIntl();

    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (editData) => {
            const equipmentType = getEquipmentTypeFromModificationType(
                editData?.modificationType
            );
            const modifications = editData?.modifications.map((modif) => {
                let modification = {};
                Object.getOwnPropertyNames(formatModification(modif)).forEach(
                    (key) => {
                        const translatedKey = intl.formatMessage({
                            id: key,
                        });
                        if (key === 'equipmentId') {
                            modification[translatedKey] = modif[key];
                        } else if (typeof modif[key] === 'object') {
                            modification[translatedKey] = modif[key]?.value;
                        }
                    }
                );
                return modification;
            });
            reset({
                [TYPE]: equipmentType,
                [MODIFICATIONS_TABLE]: modifications,
            });
        },
        [intl, reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onSubmit = useCallback(
        (formData) => {
            const modificationType = TABULAR_MODIFICATION_TYPES[formData[TYPE]];
            let modifications = getValues(MODIFICATIONS_TABLE)?.map((row) => {
                let modification = {
                    type: modificationType,
                };
                TABULAR_MODIFICATION_FIELDS[
                    getEquipmentTypeFromModificationType(modificationType)
                ].forEach((field) => {
                    const translatedKey = intl.formatMessage({
                        id: field,
                    });
                    if (field === 'equipmentId') {
                        modification[field] = row[translatedKey];
                    } else {
                        modification[field] = toModificationOperation(
                            row[translatedKey]
                        );
                    }
                });
                return modification;
            });
            createTabulareModification(
                studyUuid,
                currentNodeUuid,
                modificationType,
                modifications,
                !!editData,
                editData?.uuid
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'TabularModificationError',
                });
            });
        },
        [currentNodeUuid, editData, getValues, intl, snackError, studyUuid]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'md'}
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-tabular-modification"
                titleId="TabularModification"
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <TabularModificationForm />
            </ModificationDialog>
        </FormProvider>
    );
};

TabularModificationDialog.propTypes = {
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    editData: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default TabularModificationDialog;
