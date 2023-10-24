/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { useCallback } from 'react';
import { FetchStatus } from '../../../../services/utils';
import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../commons/modificationDialog';
import { useOpenShortWaitFetching } from "../../commons/handle-modification-form";
import { FORM_LOADING_DELAY } from "../../../network/constants";
import ByFormulaForm from "./by-formula-form";
import {
    EDITED_FIELD,
    EQUIPMENT_TYPE_FIELD,
    FILTERS,
    FORMULAS,
    ID,
    NAME, OPERATOR, REFERENCE_FIELD_OR_VALUE_1, REFERENCE_FIELD_OR_VALUE_2,
    SPECIFIC_METADATA,
    TYPE
} from "../../../utils/field-constants";

const formSchema = yup.object().shape({
    [EQUIPMENT_TYPE_FIELD]: yup.string().required(),
    [FORMULAS]: yup.array().of(yup.object().shape({
        [FILTERS]: yup
          .array()
          .of(
            yup.object().shape({
                [ID]: yup.string().required(),
                [NAME]: yup.string().required(),
                [SPECIFIC_METADATA]: yup.object().shape({
                    [TYPE]: yup.string(),
                }),
            })
          ).required(),
        [EDITED_FIELD]: yup.string().required(),
        [REFERENCE_FIELD_OR_VALUE_1]: yup.string().required(),
        [REFERENCE_FIELD_OR_VALUE_2]: yup.string().required(),
        [OPERATOR]: yup.string().required(),
    }))
}).required();

const emptyFormData = {};

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

    const clear = useCallback(() => {}, []);

    const onSubmit = useCallback(() => {}, []);

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-by-formula"
                titleId="CreateByFormula"
                open={open}
                maxWidth={'lg'}
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
