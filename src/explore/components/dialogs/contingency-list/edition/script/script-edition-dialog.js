/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup/dist/yup';

import React, { useEffect, useState } from 'react';
import {
    getContingencyListEmptyFormData,
    getScriptFormDataFromFetchedElement,
} from '../../contingency-list-utils';
import {
    getContingencyList,
    saveScriptContingencyList,
} from '../../../../../utils/rest-api';
import {
    EQUIPMENT_TYPE,
    NAME,
    SCRIPT,
} from 'explore/components/utils/field-constants';
import yup from 'components/utils/yup-config';
import ScriptEditionForm from './script-edition-form';
import CustomMuiDialog from '../../../commons/custom-mui-dialog/custom-mui-dialog';

const schema = yup.object().shape({
    [NAME]: yup.string().trim().required('nameEmpty'),
    [EQUIPMENT_TYPE]: yup.string().nullable(),
    [SCRIPT]: yup.string().nullable(),
});

const emptyFormData = (name) => getContingencyListEmptyFormData(name);

const ScriptEditionDialog = ({
    contingencyListId,
    contingencyListType,
    open,
    onClose,
    titleId,
    name,
}) => {
    const [isFetching, setIsFetching] = useState(!!contingencyListId);
    const { snackError } = useSnackMessage();

    const methods = useForm({
        defaultValues: emptyFormData(name),
        resolver: yupResolver(schema),
    });

    const {
        reset,
        formState: { errors },
    } = methods;

    const nameError = errors[NAME];
    const isValidating = errors.root?.isValidating;

    useEffect(() => {
        if (contingencyListId) {
            setIsFetching(true);
            getContingencyList(contingencyListType, contingencyListId)
                .then((response) => {
                    if (response) {
                        const formData =
                            getScriptFormDataFromFetchedElement(response);
                        reset({ ...formData, [NAME]: name });
                    }
                })
                .catch((error) => {
                    snackError({
                        messageTxt: error.message,
                        headerId: 'cannotRetrieveContingencyList',
                    });
                })
                .finally(() => setIsFetching(false));
        }
    }, [contingencyListId, contingencyListType, name, reset, snackError]);

    const closeAndClear = (event) => {
        reset(emptyFormData());
        onClose(event);
    };

    const editContingencyList = (contingencyListId, contingencyList) => {
        const newScript = {
            id: contingencyListId,
            script: contingencyList[SCRIPT],
        };
        return saveScriptContingencyList(newScript, contingencyList[NAME]);
    };

    const onSubmit = (contingencyList) => {
        editContingencyList(contingencyListId, contingencyList)
            .then(() => {
                closeAndClear();
            })
            .catch((errorMessage) => {
                snackError({
                    messageTxt: errorMessage,
                    headerId: 'contingencyListEditingError',
                    headerValues: { name },
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
            isDataFetching={isFetching}
        >
            {!isFetching && <ScriptEditionForm />}
        </CustomMuiDialog>
    );
};

export default ScriptEditionDialog;
