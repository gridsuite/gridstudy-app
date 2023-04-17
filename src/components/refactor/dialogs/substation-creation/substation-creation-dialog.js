/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../commons/modificationDialog';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { EQUIPMENT_TYPES } from '../../../util/equipment-types';
import React, { useCallback, useEffect } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../utils/yup-config';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import {
    ADDITIONAL_PROPERTIES,
    COUNTRY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    NAME,
    VALUE,
} from '../../utils/field-constants';
import { getPropertiesSchema } from './property/property-utils';
import SubstationCreationForm from './substation-creation-form';
import { createSubstation } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import CustomFormContextProvider from 'components/refactor/utils/custom-form-context';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [COUNTRY]: null,
};
const schema = yup.object().shape({
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
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const equipmentPath = 'substations';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

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
        equipmentPath,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
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
    return (
        <CustomFormContextProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                //fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-substation"
                //maxWidth={'md'}
                titleId="CreateSubstation"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <>
                    <SubstationCreationForm />
                    <EquipmentSearchDialog
                        open={searchCopy.isDialogSearchOpen}
                        onClose={searchCopy.handleCloseSearchDialog}
                        equipmentType={EQUIPMENT_TYPES.SUBSTATION.type}
                        onSelectionChange={searchCopy.handleSelectionChange}
                        currentNodeUuid={currentNodeUuid}
                    />
                </>
            </ModificationDialog>
        </CustomFormContextProvider>
    );
};

export default SubstationCreationDialog;
