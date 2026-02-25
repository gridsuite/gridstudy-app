/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
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
    DeepNullable,
    FieldType,
    MODIFICATION_TYPES,
    snackWithFallback,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect } from 'react';
import { FetchStatus } from '../../../../../services/utils';
import { useForm } from 'react-hook-form';
import { ModificationDialog } from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
import ByFormulaForm from './by-formula-form';
import {
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    FORMULAS,
    OPERATOR,
    REFERENCE_FIELD_OR_VALUE_1,
    REFERENCE_FIELD_OR_VALUE_2,
} from '../../../../utils/field-constants';
import { modifyByFormula } from '../../../../../services/study/network-modifications';
import { getFormulaInitialValue, getFormulaSchema } from './formula/formula-utils';
import { ByFormulaModificationInfos, ReferenceFieldOrValue } from '../../../../../services/network-modification-types';
import { UUID } from 'node:crypto';
import { NetworkModificationDialogProps } from '../../../../graph/menus/network-modifications/network-modification-menu.type';

function getFieldOrConvertedUnitValue(input: string, fieldType: FieldType, convert: boolean): ReferenceFieldOrValue {
    const value = input.replace(',', '.');
    const isNumber = !Number.isNaN(Number.parseFloat(value));

    if (isNumber) {
        return {
            value: convert ? convertOutputValue(fieldType, value) : value,
            equipmentField: null,
        };
    } else {
        return {
            value: null,
            equipmentField: input,
        };
    }
}

function shouldConvert(isNumber1: boolean, isNumber2: boolean, operator: string) {
    switch (operator) {
        case 'DIVISION':
            if (isNumber1 && isNumber2) {
                return { convertValue1: true, convertValue2: false };
            }
            return { convertValue1: false, convertValue2: false };
        case 'MULTIPLICATION':
        case 'PERCENTAGE':
            if (isNumber1 && isNumber2) {
                return { convertValue1: false, convertValue2: true };
            }
            return { convertValue1: false, convertValue2: false };
        default: // Any Other case : convert
            return { convertValue1: true, convertValue2: true };
    }
}

function shouldConvertFromNumber(input1: number | null, input2: number | null, operator: string) {
    const isNumber1 = input1 !== null && !Number.isNaN(input1);
    const isNumber2 = input2 !== null && !Number.isNaN(input2);
    return shouldConvert(isNumber1, isNumber2, operator);
}

function shouldConvertFromString(input1: string | null, input2: string | null, operator: string) {
    const isNumber1 = input1 !== null && !Number.isNaN(Number.parseFloat(input1.replace(',', '.')));
    const isNumber2 = input2 !== null && !Number.isNaN(Number.parseFloat(input2.replace(',', '.')));
    return shouldConvert(isNumber1, isNumber2, operator);
}

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_TYPE_FIELD]: yup.string().required(),
        [FORMULAS]: getFormulaSchema(),
    })
    .required();

export type ByFormulaFormData = yup.InferType<typeof formSchema>;

const emptyFormData: DeepNullable<ByFormulaFormData> = {
    [EQUIPMENT_TYPE_FIELD]: '',
    [FORMULAS]: [getFormulaInitialValue()],
};

export type ByFormulaDialogProps = NetworkModificationDialogProps & {
    editData: ByFormulaModificationInfos;
};

const ByFormulaDialog = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: ByFormulaDialogProps) => {
    const currentNodeUuid = currentNode.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm<DeepNullable<ByFormulaFormData>>({
        defaultValues: emptyFormData,
        resolver: yupResolver<DeepNullable<ByFormulaFormData>>(formSchema),
    });

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            const formulas = editData.formulaInfosList?.map((formula) => {
                const shouldConverts = shouldConvertFromNumber(
                    formula?.fieldOrValue1?.value,
                    formula?.fieldOrValue2?.value,
                    formula?.operator
                );

                const valueConverted1 = shouldConverts.convertValue1
                    ? convertInputValue(formula.editedField as FieldType, formula?.fieldOrValue1?.value)
                    : formula?.fieldOrValue1?.value;
                const valueConverted2 = shouldConverts.convertValue2
                    ? convertInputValue(formula.editedField as FieldType, formula?.fieldOrValue2?.value)
                    : formula?.fieldOrValue2?.value;

                const ref1 = valueConverted1?.toString() ?? formula?.fieldOrValue1?.equipmentField;
                const ref2 = valueConverted2?.toString() ?? formula?.fieldOrValue2?.equipmentField;
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
        (data: ByFormulaFormData) => {
            const formulas = data[FORMULAS]?.map((formula) => {
                const shouldConverts = shouldConvertFromString(
                    formula[REFERENCE_FIELD_OR_VALUE_1] as string,
                    formula[REFERENCE_FIELD_OR_VALUE_2] as string,
                    formula[OPERATOR]
                );
                const fieldOrValue1 = getFieldOrConvertedUnitValue(
                    formula[REFERENCE_FIELD_OR_VALUE_1] as string,
                    formula[EDITED_FIELD] as FieldType,
                    shouldConverts.convertValue1
                );
                const fieldOrValue2 = getFieldOrConvertedUnitValue(
                    formula[REFERENCE_FIELD_OR_VALUE_2] as string,
                    formula[EDITED_FIELD] as FieldType,
                    shouldConverts.convertValue2
                );

                const filters = formula[FILTERS]?.map((filter) => {
                    return {
                        id: filter.id as UUID,
                        name: filter.name,
                    };
                });

                return {
                    fieldOrValue1,
                    fieldOrValue2,
                    filters,
                    operator: formula.operator,
                    editedField: formula.editedField,
                };
            });

            const byFormulaModificationInfos = {
                type: MODIFICATION_TYPES.BY_FORMULA_MODIFICATION.type,
                identifiableType: data[EQUIPMENT_TYPE_FIELD],
                formulaInfosList: formulas ?? [],
            };

            modifyByFormula(studyUuid, currentNodeUuid, byFormulaModificationInfos, editData?.uuid).catch((error) => {
                snackWithFallback(snackError, error, { headerId: 'ModifyByFormula' });
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
                titleId="ModifyByFormula"
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
                <ByFormulaForm />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default ByFormulaDialog;
