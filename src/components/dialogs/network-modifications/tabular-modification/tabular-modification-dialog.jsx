/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { MODIFICATIONS_TABLE, TYPE } from 'components/utils/field-constants';
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { createTabulareModification } from 'services/study/network-modifications';
import { FetchStatus } from 'services/utils';
import TabularModificationForm from './tabular-modification-form';
import {
    convertGeneratorOrBatteryModificationFromBackToFront,
    convertGeneratorOrBatteryModificationFromFrontToBack,
    convertInputValues,
    convertOutputValues,
    formatModification,
    getEquipmentTypeFromModificationType,
    getFieldType,
    TABULAR_MODIFICATION_TYPES,
} from './tabular-modification-utils';
import { useIntl } from 'react-intl';

const formSchema = yup
    .object()
    .shape({
        [TYPE]: yup.string().nullable().required(),
        [MODIFICATIONS_TABLE]: yup.array().min(1, 'ModificationsRequiredTabError').required(),
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

    const {
        reset,
        formState: { errors },
    } = formMethods;

    const disableSave = Object.keys(errors).length > 0;

    useEffect(() => {
        if (editData) {
            const modificationType = editData.modificationType;
            const modifications = editData.modifications.map((modif) => {
                let modification = formatModification(modif);
                if (
                    modificationType === TABULAR_MODIFICATION_TYPES.GENERATOR ||
                    modificationType === TABULAR_MODIFICATION_TYPES.BATTERY
                ) {
                    modification = convertGeneratorOrBatteryModificationFromBackToFront(modification);
                } else {
                    Object.keys(modification).forEach((key) => {
                        modification[key] = convertInputValues(getFieldType(modificationType, key), modif[key]);
                    });
                }
                return modification;
            });
            reset({
                [TYPE]: getEquipmentTypeFromModificationType(modificationType),
                [MODIFICATIONS_TABLE]: modifications,
            });
        }
    }, [editData, reset, intl]);

    const onSubmit = useCallback(
        (formData) => {
            const modificationType = TABULAR_MODIFICATION_TYPES[formData[TYPE]];
            const modifications = formData[MODIFICATIONS_TABLE]?.map((row) => {
                let modification = {
                    type: modificationType,
                };
                if (
                    modificationType === TABULAR_MODIFICATION_TYPES.GENERATOR ||
                    modificationType === TABULAR_MODIFICATION_TYPES.BATTERY
                ) {
                    const generatorOrBatteryModification = convertGeneratorOrBatteryModificationFromFrontToBack(row);
                    modification = {
                        ...generatorOrBatteryModification,
                        ...modification,
                    };
                } else {
                    Object.keys(row).forEach((key) => {
                        modification[key] = convertOutputValues(getFieldType(modificationType, key), row[key]);
                    });
                }
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

    const dataFetching = useMemo(() => {
        return isUpdate && editDataFetchStatus === FetchStatus.RUNNING;
    }, [editDataFetchStatus, isUpdate]);

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth={'lg'}
                onClear={clear}
                onSave={onSubmit}
                disabledSave={disableSave}
                titleId="TabularModification"
                open={open}
                isDataFetching={dataFetching}
                {...dialogProps}
            >
                <TabularModificationForm dataFetching={dataFetching} />
            </ModificationDialog>
        </CustomFormProvider>
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
