/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import EquipmentSearchDialog from '../../../equipment-search-dialog';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import React, { useCallback, useEffect } from 'react';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { useFormSearchCopy } from '../../../form-search-copy-hook';
import {
    COUNTRY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
} from 'components/utils/field-constants';
import SubstationCreationForm from './substation-creation-form';
import { sanitizeString } from '../../../dialogUtils';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { createSubstation } from '../../../../../services/study/network-modifications';
import {
    copyEquipmentPropertiesForCreation,
    creationPropertiesSchema,
    emptyProperties,
    fetchDefaultCountry,
    getPropertiesFromModification,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { FetchStatus } from '../../../../../services/utils';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [COUNTRY]: null,
    ...emptyProperties,
};
const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        [COUNTRY]: yup.string().nullable(),
    })
    .concat(creationPropertiesSchema);

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

    const { reset, getValues } = formMethods;

    const fromSearchCopyToFormValues = (substation) => {
        reset(
            {
                [EQUIPMENT_ID]: substation.id + '(1)',
                [EQUIPMENT_NAME]: substation.name ?? '',
                [COUNTRY]: substation.country,
                ...copyEquipmentPropertiesForCreation(substation),
            },
            { keepDefaultValues: true }
        );
    };

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
        elementType: EQUIPMENT_TYPES.SUBSTATION,
    });

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData.equipmentName ?? '',
                [COUNTRY]: editData.country,
                ...getPropertiesFromModification(editData.properties),
            });
        }
    }, [reset, editData]);

    // We set the default country if there is one
    useEffect(() => {
        fetchDefaultCountry().then((country) => {
            if (country) {
                reset({
                    ...getValues(),
                    [COUNTRY]: country,
                });
            }
        });
    }, [reset, getValues]);

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
                toModificationProperties(substation)
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
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
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
                    equipmentType={EQUIPMENT_TYPES.SUBSTATION}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default SubstationCreationDialog;
