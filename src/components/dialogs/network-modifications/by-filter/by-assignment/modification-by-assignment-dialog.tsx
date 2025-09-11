/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    convertInputValue,
    convertOutputValue,
    CustomFormProvider,
    FieldType,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { FC, useCallback, useEffect, useMemo } from 'react';
import { FetchStatus } from '../../../../../services/utils';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import ModificationByAssignmentForm from './modification-by-assignment-form';
import { ASSIGNMENTS, EDITED_FIELD, EQUIPMENT_TYPE_FIELD, VALUE_FIELD } from '../../../../utils/field-constants';
import { modifyByAssignment } from '../../../../../services/study/network-modifications';
import {
    getAssignmentFromEditData,
    getAssignmentInitialValue,
    getAssignmentsSchema,
    getDataType,
} from './assignment/assignment-utils';
import { Assignment, ModificationByAssignment } from './assignment/assignment.type';
import { DeepNullable } from '../../../../utils/ts-utils';
import { useIntl } from 'react-intl';

const emptyFormData = {
    [EQUIPMENT_TYPE_FIELD]: '',
    [ASSIGNMENTS]: [getAssignmentInitialValue()],
};

const ModificationByAssignmentDialog: FC<any> = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();
    const intl = useIntl();

    const noneStr = useMemo(() => {
        return intl.formatMessage({ id: 'EmptyField' });
    }, [intl]);
    const formSchema = yup
        .object()
        .shape({
            [EQUIPMENT_TYPE_FIELD]: yup.string().required(),
            [ASSIGNMENTS]: getAssignmentsSchema(noneStr),
        })
        .required();

    // "DeepNullable" to allow deeply null values as default values for required values
    // ("undefined" is accepted here in RHF, but it conflicts with MUI behaviour which does not like undefined values)
    const formMethods = useForm<DeepNullable<ModificationByAssignment>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<ModificationByAssignment>>(formSchema),
    });

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            const assignments: Assignment[] =
                editData.assignmentInfosList?.map((info: Assignment) => {
                    const assignment = getAssignmentFromEditData(info);
                    const fieldKey = assignment[EDITED_FIELD] as keyof typeof FieldType;
                    const field = FieldType[fieldKey];
                    const value = assignment[VALUE_FIELD];
                    let valueConverted = convertInputValue(field, value);
                    if (!valueConverted || valueConverted === '') {
                        valueConverted = noneStr;
                    }
                    return {
                        ...assignment,
                        [VALUE_FIELD]: valueConverted,
                    };
                }) || [];
            reset({
                [EQUIPMENT_TYPE_FIELD]: editData.equipmentType,
                [ASSIGNMENTS]: assignments,
            });
        }
    }, [editData, intl, noneStr, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (formData: ModificationByAssignment) => {
            const assignmentsList = formData[ASSIGNMENTS].map((assignment) => {
                const dataType = getDataType(assignment[EDITED_FIELD]);
                const fieldKey = assignment[EDITED_FIELD] as keyof typeof FieldType;
                const field: FieldType = FieldType[fieldKey];
                let value = assignment[VALUE_FIELD];
                // None values have to be set to an empty string :
                if (value === noneStr) {
                    // put this in convertOutputValue ??
                    value = '';
                }
                const valueConverted = convertOutputValue(field, value);
                return {
                    ...assignment,
                    dataType,
                    [VALUE_FIELD]: valueConverted,
                };
            });
            modifyByAssignment(
                studyUuid,
                currentNodeUuid,
                formData[EQUIPMENT_TYPE_FIELD],
                assignmentsList,
                !!editData,
                editData?.uuid ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ModifyByAssignment',
                });
            });
        },
        [currentNodeUuid, editData, noneStr, snackError, studyUuid]
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                titleId="ModifyByAssignment"
                open={open}
                maxWidth={'xl'}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                PaperProps={{
                    sx: {
                        height: '95vh',
                    },
                }}
                {...dialogProps}
            >
                <ModificationByAssignmentForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default ModificationByAssignmentDialog;
