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
import { FORM_LOADING_DELAY, LOAD_TYPES } from 'components/network/constants';
import { MODIFICATIONS_TABLE, TYPE } from 'components/utils/field-constants';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';
import { createTabulareModification } from 'services/study/network-modifications';
import { FetchStatus } from 'services/utils';
import TabularModificationForm from './tabular-modification-form';
import {
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
        [MODIFICATIONS_TABLE]: yup
            .array()
            .min(1, 'ModificationsRequiredTabError')
            .required(),
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

    const { reset } = formMethods;

    const getValueFromEnum = useCallback(
        (content, possibleValuesKeys) => {
            const value = possibleValuesKeys.find(
                (option) => intl.formatMessage({ id: option.label }) === content
            );
            return value.id;
        },
        [intl]
    );

    useEffect(() => {
        if (editData) {
            const equipmentType = getEquipmentTypeFromModificationType(
                editData?.modificationType
            );
            const modifications = editData?.modifications.map((modif) => {
                const modification = {};
                Object.keys(formatModification(modif)).forEach((key) => {
                    const field = modif[key];
                    if (key === 'equipmentId') {
                        modification[key] = field;
                    } else {
                        modification[key] = field?.value;
                    }
                });
                return modification;
            });
            reset({
                [TYPE]: equipmentType,
                [MODIFICATIONS_TABLE]: modifications,
            });
        }
    }, [editData, reset, intl]);

    const onSubmit = useCallback(
        (formData) => {
            const modificationType = TABULAR_MODIFICATION_TYPES[formData[TYPE]];
            const modifications = formData[MODIFICATIONS_TABLE]?.map((row) => {
                const modification = {
                    type: modificationType,
                };
                Object.keys(row).forEach((key) => {
                    const value = row[key];
                    if (key === 'equipmentId') {
                        modification[key] = value;
                    } else if (key === 'loadType') {
                        modification[key] = toModificationOperation(
                            getValueFromEnum(value, LOAD_TYPES)
                        );
                    } else {
                        modification[key] = toModificationOperation(value);
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
        [currentNodeUuid, editData, snackError, studyUuid, getValueFromEnum]
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
                maxWidth={false}
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
