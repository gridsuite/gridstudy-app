/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    CONTINGENCY_LIST_TYPE,
    EQUIPMENT_TABLE,
    NAME,
    SCRIPT,
} from '../../../utils/field-constants';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';
import { createContingencyList } from '../../../../utils/rest-api';
import React from 'react';
import CustomMuiDialog from '../../commons/custom-mui-dialog/custom-mui-dialog';
import ContingencyListCreationForm from './contingency-list-creation-form';
import {
    getContingencyListEmptyFormData,
    getFormContent,
} from '../contingency-list-utils';
import yup from '../../../utils/yup-config';
import { getExplicitNamingSchema } from '../explicit-naming/explicit-naming-form';
import { getCriteriaBasedSchema } from '../../commons/criteria-based/criteria-based-utils';

const schema = yup.object().shape({
    [NAME]: yup.string().trim().required('nameEmpty'),
    [CONTINGENCY_LIST_TYPE]: yup.string().nullable(),
    [SCRIPT]: yup.string().nullable(),
    ...getExplicitNamingSchema(EQUIPMENT_TABLE),
    ...getCriteriaBasedSchema(),
});

const emptyFormData = getContingencyListEmptyFormData();

const ContingencyListCreationDialog = ({ onClose, open, titleId }) => {
    const activeDirectory = useSelector((state) => state.activeDirectory);
    const { snackError } = useSnackMessage();

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const {
        reset,
        formState: { errors },
    } = methods;

    const nameError = errors[NAME];
    const isValidating = errors.root?.isValidating;

    const closeAndClear = (event) => {
        reset(emptyFormData);
        onClose(event);
    };

    const onSubmit = (data) => {
        const formContent = getFormContent(null, data);
        createContingencyList(
            data[CONTINGENCY_LIST_TYPE],
            data[NAME],
            formContent,
            activeDirectory
        )
            .then(() => closeAndClear())
            .catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'contingencyListCreationError',
                    headerValues: { name: data[NAME] },
                });
            });
    };
    return (
        <CustomMuiDialog
            open={open}
            onClose={closeAndClear}
            onSave={onSubmit}
            formSchema={schema}
            formMethods={methods}
            titleId={titleId}
            removeOptional={true}
            disabledSave={!!nameError || isValidating}
        >
            <ContingencyListCreationForm />
        </CustomMuiDialog>
    );
};

export default ContingencyListCreationDialog;
