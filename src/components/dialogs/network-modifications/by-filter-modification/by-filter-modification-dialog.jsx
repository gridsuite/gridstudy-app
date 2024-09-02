/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback, useEffect } from 'react';
import { FetchStatus } from '../../../../services/utils';
import { useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import ByFilterModificationForm from './by-filter-modification-form';
import {
    DATA_TYPE,
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    PROPERTY_NAME_FIELD,
    SIMPLE_MODIFICATIONS,
    VALUE_FIELD,
} from '../../../utils/field-constants';
import { modifyByFilter } from '../../../../services/study/network-modifications';
import {
    getDataType,
    getModificationLineInitialValue,
    getModificationLinesSchema,
} from './modification-line/modification-line-utils.ts';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_TYPE_FIELD]: yup.string().required(),
        ...getModificationLinesSchema(SIMPLE_MODIFICATIONS),
    })
    .required();

const emptyFormData = {
    [EQUIPMENT_TYPE_FIELD]: '',
    [SIMPLE_MODIFICATIONS]: [getModificationLineInitialValue()],
};

const ByFilterModificationDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            const simpleModifications = editData.simpleModificationInfosList?.map((simpleModification) => ({
                [PROPERTY_NAME_FIELD]: simpleModification.propertyName,
                [VALUE_FIELD]: simpleModification.value,
                [EDITED_FIELD]: simpleModification.editedField,
                [DATA_TYPE]: getDataType(simpleModification.editedField),
                [FILTERS]: simpleModification.filters,
            }));
            reset({
                [EQUIPMENT_TYPE_FIELD]: editData.equipmentType,
                [SIMPLE_MODIFICATIONS]: simpleModifications,
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (formData) => {
            const simpleModificationsList = formData[SIMPLE_MODIFICATIONS].map((simpleModification) => {
                const dataType = getDataType(simpleModification[EDITED_FIELD]);
                return {
                    ...simpleModification,
                    dataType,
                };
            });
            modifyByFilter(
                studyUuid,
                currentNodeUuid,
                formData[EQUIPMENT_TYPE_FIELD],
                simpleModificationsList,
                !!editData,
                editData?.uuid ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ModifyByFilter',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-by-filter"
                titleId="ModifyByFilter"
                open={open}
                maxWidth={'xl'}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <ByFilterModificationForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default ByFilterModificationDialog;
