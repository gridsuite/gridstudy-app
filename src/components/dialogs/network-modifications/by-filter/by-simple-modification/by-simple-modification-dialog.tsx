/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { FC, useCallback, useEffect } from 'react';
import { FetchStatus } from '../../../../../services/utils';
import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import BySimpleModificationForm from './by-simple-modification-form';
import { EDITED_FIELD, EQUIPMENT_TYPE_FIELD, SIMPLE_MODIFICATIONS } from '../../../../utils/field-constants';
import { modifyBySimpleModification } from '../../../../../services/study/network-modifications';
import {
    getDataType,
    getSimpleModificationFromEditData,
    getSimpleModificationInitialValue,
    getSimpleModificationsSchema,
} from './simple-modification/simple-modification-utils';
import { BySimpleModification, SimpleModification } from './simple-modification/simple-modification.type';
import { DeepNullable } from '../../../../utils/ts-utils';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_TYPE_FIELD]: yup.string().required(),
        [SIMPLE_MODIFICATIONS]: getSimpleModificationsSchema(),
    })
    .required();

const emptyFormData = {
    [EQUIPMENT_TYPE_FIELD]: '',
    [SIMPLE_MODIFICATIONS]: [getSimpleModificationInitialValue()],
};

const BySimpleModificationDialog: FC<any> = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    // "DeepNullable" to allow deeply null values as default values for required values
    // ("undefined" is accepted here in RHF, but it conflicts with MUI behaviour which does not like undefined values)
    const formMethods = useForm<DeepNullable<BySimpleModification>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<BySimpleModification>>(formSchema),
    });

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            const simpleModifications: SimpleModification[] = editData.simpleModificationInfosList?.map(
                getSimpleModificationFromEditData
            );
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
        (formData: BySimpleModification) => {
            const simpleModificationsList = formData[SIMPLE_MODIFICATIONS].map((simpleModification) => {
                const dataType = getDataType(simpleModification[EDITED_FIELD]);
                return {
                    ...simpleModification,
                    dataType,
                };
            });
            modifyBySimpleModification(
                studyUuid,
                currentNodeUuid,
                formData[EQUIPMENT_TYPE_FIELD],
                simpleModificationsList,
                !!editData,
                editData?.uuid ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ModifyBySimpleModification',
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
                aria-labelledby="dialog-modify-by-simple-modification"
                titleId="ModifyBySimpleModification"
                open={open}
                maxWidth={'xl'}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <BySimpleModificationForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default BySimpleModificationDialog;
