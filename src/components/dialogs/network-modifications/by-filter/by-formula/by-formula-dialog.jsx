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
    FieldType,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { useCallback, useEffect } from 'react';
import { FetchStatus } from '../../../../../services/utils';
import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import { useOpenShortWaitFetching } from '../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../network/constants';
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
} from '../../../../utils/field-constants';
import { modifyByFormula } from '../../../../../services/study/network-modifications';
import { getFormulaInitialValue, getFormulaSchema } from './formula/formula-utils';

function getFieldOrConvertedUnitValue(input, fieldType, convert) {
    const value = input.replace(',', '.');
    const isNumber = !isNaN(parseFloat(value));

    if (isNumber) {
        return { [VALUE]: convert ? convertOutputValue(fieldType, value) : value, [EQUIPMENT_FIELD]: null };
    } else {
        return { [VALUE]: null, [EQUIPMENT_FIELD]: input };
    }
}

export function shouldConvert(fieldType, input1, input2, operator) {
    const isNumber1 = input1 && (!isNaN(input1) || !isNaN(parseFloat(input1.replace(',', '.'))));
    const isNumber2 = input2 && (!isNaN(input2) || !isNaN(parseFloat(input2.replace(',', '.'))));

    let convert1 = true;
    let convert2 = true;

    switch (operator) {
        case 'MULTIPLICATION':
            // if we have 2 number multiply first one only
            if (isNumber1 && isNumber2) {
                convert2 = false;
                break;
            }
            // if 1 number and one field do not multiply number
            if (isNumber1 !== isNumber2) {
                convert1 = false;
                convert2 = false;
            }
            break;
        case 'DIVISION':
            // if we have 2 number multiply first one only
            if (isNumber1 && isNumber2) {
                convert2 = false;
                break;
            }

            // if 1 number and one field do not convert number
            if (isNumber1 !== isNumber2) {
                convert1 = false;
                convert2 = false;
            }
            break;
        case 'PERCENTAGE': //do not convert
            convert1 = false;
            convert2 = false;
            break;
        default:
            return { convert1: true, convert2: true };
    }
    return { convert1: convert1, convert2: convert2 };
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

const ByFormulaDialog = ({ editData, currentNode, studyUuid, isUpdate, editDataFetchStatus, ...dialogProps }) => {
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
            const formulas = editData.formulaInfosList?.map((formula) => {
                console.log('formula : ', formula);
                console.log('formula?.fieldOrValue1 : ', formula?.fieldOrValue1.value);
                console.log('formula?.fieldOrValue2 : ', formula?.fieldOrValue2.value);
                console.log('FieldType[formula[EDITED_FIELD]] : ', FieldType[formula[EDITED_FIELD]]);
                console.log('formula?.operator : ', formula?.operator);

                const shouldConverts = shouldConvert(
                    formula?.editedField,
                    formula?.fieldOrValue1?.value,
                    formula?.fieldOrValue2?.value,
                    formula?.operator
                );

                const valueConverted1 = shouldConverts.convert1
                    ? convertInputValue(FieldType[formula[EDITED_FIELD]], formula?.fieldOrValue1?.value)
                    : formula?.fieldOrValue1?.value;
                const valueConverted2 = shouldConverts.convert1
                    ? convertInputValue(FieldType[formula[EDITED_FIELD]], formula?.fieldOrValue2?.value)
                    : formula?.fieldOrValue2.value;

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
        (data) => {
            const formulas = data[FORMULAS].map((formula) => {
                const shouldConverts = shouldConvert(
                    FieldType[formula[EDITED_FIELD]],
                    formula[REFERENCE_FIELD_OR_VALUE_1],
                    formula[REFERENCE_FIELD_OR_VALUE_2],
                    formula[OPERATOR]
                );
                const fieldOrValue1 = getFieldOrConvertedUnitValue(
                    formula[REFERENCE_FIELD_OR_VALUE_1],
                    FieldType[formula[EDITED_FIELD]],
                    shouldConverts.convert1
                );
                const fieldOrValue2 = getFieldOrConvertedUnitValue(
                    formula[REFERENCE_FIELD_OR_VALUE_2],
                    FieldType[formula[EDITED_FIELD]],
                    shouldConverts.convert2
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
                editData?.uuid ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'ModifyByFormula',
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
                aria-labelledby="dialog-by-formula"
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
