/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import React, { FunctionComponent, useCallback } from 'react';
import {
    COLUMNS_DEFINITIONS_LIMIT_REDUCTIONS,
    IColumnsDef,
    IST_FORM,
    LIMIT_DURATION1_FORM,
    LIMIT_DURATION2_FORM,
    LIMIT_DURATION3_FORM,
    LIMIT_REDUCTIONS_FORM,
    VOLTAGE_LEVELS_FORM,
} from './columns-definitions';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../../utils/yup-config';
import { CustomFormProvider } from '@gridsuite/commons-ui';
import { useIntl } from 'react-intl';
import LimitReductionsTable from './limit-reductions-table';

const LimitReductionsTableForm: FunctionComponent = () => {
    const intl = useIntl();

    const formSchema = yup
        .object()
        .shape({
            [LIMIT_REDUCTIONS_FORM]: yup.array().of(
                yup.object().shape({
                    [VOLTAGE_LEVELS_FORM]: yup.string(),
                    [IST_FORM]: yup.number(),
                    [LIMIT_DURATION1_FORM]: yup.number(),
                    [LIMIT_DURATION2_FORM]: yup.number(),
                    [LIMIT_DURATION3_FORM]: yup.number(),
                })
            ),
        })
        .required();

    const emptyFormData = {
        [LIMIT_REDUCTIONS_FORM]: [
            {
                voltageLevelsForm: '20',
                istForm: 1,
                limitReduction1Form: 1,
                limitReduction2Form: 1,
                limitReduction3Form: 1,
            },
        ],
    };

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    //const { reset } = formMethods;

    const getColumnsDefinition = useCallback(
        (columns: IColumnsDef[]) => {
            if (columns) {
                return columns.map((column) => ({
                    ...column,
                    label: intl.formatMessage({ id: column.label }),
                }));
            }
            return [];
        },
        [intl]
    );

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <LimitReductionsTable
                columnsDefinition={getColumnsDefinition(
                    COLUMNS_DEFINITIONS_LIMIT_REDUCTIONS
                )}
                tableHeight={367}
            />
        </CustomFormProvider>
    );
};

export default LimitReductionsTableForm;
