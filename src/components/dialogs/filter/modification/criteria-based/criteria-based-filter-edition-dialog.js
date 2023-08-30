/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import PropTypes from 'prop-types';
import { getFilterById } from 'services/filter';
import { saveFilter } from 'services/explore';
import { FILTER_TYPES } from 'components/network/constants';
import { elementType } from '@gridsuite/commons-ui';
import {
    backToFrontTweak,
    frontToBackTweak,
} from '../../creation/criteria-based/criteria-based-filter-dialog-utils';

import NameWrapper from '../../name-wrapper';
import CriteriaBasedFilterForm, {
    criteriaBasedFilterSchema,
} from '../../creation/criteria-based/criteria-based-filter-form';
import yup from 'components/utils/yup-config';
import {
    EQUIPMENT_TYPE,
    FILTER_TYPE,
    NAME,
} from 'components/utils/field-constants';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';
import { FetchStatus } from 'services/utils';

const formSchema = yup
    .object()
    .shape({
        [NAME]: yup.string().required(),
        [FILTER_TYPE]: yup.string().required(),
        [EQUIPMENT_TYPE]: yup.string().required(),
        ...criteriaBasedFilterSchema,
    })
    .required();

export const CriteriaBasedFilterEditionDialog = ({
    id,
    name,
    titleId,
    open,
    onClose,
    activeDirectory,
}) => {
    const { snackError } = useSnackMessage();
    const [isNameValid, setIsNameValid] = useState(true);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    // default values are set via reset when we fetch data
    const formMethods = useForm({
        resolver: yupResolver(formSchema),
    });

    const { reset, setValue } = formMethods;

    // Fetch the filter data from back-end if necessary and fill the form with it
    useEffect(() => {
        if (id && open) {
            setDataFetchStatus(FetchStatus.FETCHING);
            getFilterById(id)
                .then((response) => {
                    setDataFetchStatus(FetchStatus.FETCH_SUCCESS);
                    reset({
                        [NAME]: name,
                        [FILTER_TYPE]: FILTER_TYPES.CRITERIA_BASED.id,
                        ...backToFrontTweak(response),
                    });
                })
                .catch((error) => {
                    setDataFetchStatus(FetchStatus.FETCH_ERROR);
                    snackError({
                        messageTxt: error.message,
                        headerId: 'cannotRetrieveFilter',
                    });
                });
        }
    }, [id, name, open, reset, snackError]);

    const onSubmit = useCallback(
        (filterForm) => {
            saveFilter(
                frontToBackTweak(id, filterForm),
                filterForm[NAME]
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                });
            });
        },
        [id, snackError]
    );

    const handleNameChange = (isValid, newName) => {
        setIsNameValid(isValid);
        setValue(NAME, newName);
    };

    const isDataReady = dataFetchStatus === FetchStatus.FETCH_SUCCESS;

    return (
        <FormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
        >
            <ModificationDialog
                open={open}
                onClose={onClose}
                onClear={onClose}
                onSave={onSubmit}
                titleId={titleId}
                disabledSave={!isNameValid}
                maxWidth={'md'}
                isDataFetching={dataFetchStatus === FetchStatus.FETCHING}
            >
                <NameWrapper
                    titleMessage="Name"
                    initialValue={name}
                    contentType={elementType.FILTER}
                    handleNameValidation={handleNameChange}
                    activeDirectory={activeDirectory}
                >
                    {isDataReady && <CriteriaBasedFilterForm />}
                </NameWrapper>
            </ModificationDialog>
        </FormProvider>
    );
};

CriteriaBasedFilterEditionDialog.prototype = {
    id: PropTypes.string,
    name: PropTypes.string,
    titleId: PropTypes.string.isRequired,
    open: PropTypes.bool,
    onClose: PropTypes.func.isRequired,
};

export default CriteriaBasedFilterEditionDialog;
