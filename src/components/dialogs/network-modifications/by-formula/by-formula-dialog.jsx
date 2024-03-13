/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback, useEffect } from 'react';
import { FetchStatus } from '../../../../services/utils';
import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import ByFormulaForm from './by-formula-form';
import {
    EDITED_FIELD,
    EQUIPMENT_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    FORMULAS,
    OPERATOR,
    REFERENCE_FIELD_OR_VALUE_1,
    REFERENCE_FIELD_OR_VALUE_2,
    VALUE,
} from '../../../utils/field-constants';
import { modifyByFormula } from '../../../../services/study/network-modifications';
import {
    getFormulaInitialValue,
    getFormulaSchema,
} from './formula/formula-utils';

function getFieldOrValue(input) {
    const value = input.replace(',', '.');
    const isNumber = !isNaN(parseFloat(value));
    return {
        [VALUE]: isNumber ? value : null,
        [EQUIPMENT_FIELD]: isNumber ? null : input,
    };
}

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_TYPE_FIELD]: yup.string().required(),
        ...getFormulaSchema(FORMULAS),
    })
    .required();

const emptyFormData = {
    [EQUIPMENT_TYPE_FIELD]: '',
    [FORMULAS]: [getFormulaInitialValue()],
};

const ByFormulaDialog = ({
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
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            const formulas = editData.formulaInfosList?.map((formula) => {
                const ref1 =
                    formula?.fieldOrValue1?.value?.toString() ??
                    formula?.fieldOrValue1?.equipmentField;
                const ref2 =
                    formula?.fieldOrValue2?.value?.toString() ??
                    formula?.fieldOrValue2?.equipmentField;
                return {
                    [REFERENCE_FIELD_OR_VALUE_1]: ref1,
                    [REFERENCE_FIELD_OR_VALUE_2]: ref2,
                    [EDITED_FIELD]: formula.editedField,
                    [OPERATOR]: formula.operator,
                    [FILTERS]: formula.filters,
                };
            });
            reset({
                [EQUIPMENT_TYPE_FIELD]: editData.identifiableType,
                [FORMULAS]: formulas,
            });
        }
    }, [editData, reset]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (data) => {
            const formulas = data[FORMULAS].map((formula) => {
                const fieldOrValue1 = getFieldOrValue(
                    formula[REFERENCE_FIELD_OR_VALUE_1],
                );
                const fieldOrValue2 = getFieldOrValue(
                    formula[REFERENCE_FIELD_OR_VALUE_2],
                );
                return {
                    fieldOrValue1,
                    fieldOrValue2,
                    ...formula,
                };
            });
            modifyByFormula(
                studyUuid,
                currentNodeUuid,
                data[EQUIPMENT_TYPE_FIELD],
                formulas,
                !!editData,
                editData?.uuid ?? null,
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ByFormulaModification',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid],
    );

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-by-formula"
                titleId="ModifyByFormula"
                open={open}
                maxWidth={'xl'}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <ByFormulaForm />
            </ModificationDialog>
        </FormProvider>
    );
};

export default ByFormulaDialog;
