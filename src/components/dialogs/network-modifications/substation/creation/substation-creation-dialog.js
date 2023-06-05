/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import React, { useCallback, useEffect } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import {
    ADDITIONAL_PROPERTIES,
    COUNTRY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    NAME,
    VALUE,
} from 'components/utils/field-constants';
import { getPropertiesSchema } from '../property/property-utils';
import SubstationCreationForm from './substation-creation-form';
import { createSubstation, FetchStatus } from 'utils/rest-api';
import { sanitizeString } from '../../../dialogUtils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [COUNTRY]: null,
};
const formSchema = yup.object().shape({
    [EQUIPMENT_ID]: yup.string().required(),
    [EQUIPMENT_NAME]: yup.string(),
    [COUNTRY]: yup.string().nullable(),
    ...getPropertiesSchema(),
});

const getProperties = (properties) => {
    return properties
        ? Object.entries(properties).map((p) => {
              return { [NAME]: p[0], [VALUE]: p[1] };
          })
        : null;
};
const SubstationCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    const fromSearchCopyToFormValues = (substation) => {
        reset(
            {
                [EQUIPMENT_ID]: substation.id + '(1)',
                [EQUIPMENT_NAME]: substation.name ?? '',
                [COUNTRY]: substation.countryCode,
                [ADDITIONAL_PROPERTIES]: getProperties(substation.properties),
            },
            { keepDefaultValues: true }
        );
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.SUBSTATION.type,
    });

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData.equipmentName ?? '',
                [COUNTRY]: editData.substationCountry,
                [ADDITIONAL_PROPERTIES]: getProperties(editData.properties),
            });
        }
    }, [reset, editData]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback(
        (substation) => {
            createSubstation(
                studyUuid,
                currentNodeUuid,
                substation[EQUIPMENT_ID],
                sanitizeString(substation[EQUIPMENT_NAME]),
                substation[COUNTRY],
                !!editData,
                editData ? editData.uuid : undefined,
                substation[ADDITIONAL_PROPERTIES]
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'SubstationCreationError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-substation"
                maxWidth={'md'}
                titleId="CreateSubstation"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <SubstationCreationForm />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.SUBSTATION.type}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default SubstationCreationDialog;
