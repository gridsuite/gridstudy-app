/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from '../commons/modificationDialog';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from '../../utils/yup-config';
import {
    ADDITIONAL_PROPERTIES,
    COUNTRY,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    NAME,
    PREVIOUS_VALUE,
    VALUE,
} from '../../utils/field-constants';
import { getPropertiesSchema } from '../substation-creation/property/property-utils';
import SubstationModificationForm from './substation-modification-form';
import { modifySubstation } from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';

const schema = yup.object().shape({
    [EQUIPMENT_ID]: yup.string().nullable().required(),
    [EQUIPMENT_NAME]: yup.string(),
    [COUNTRY]: yup.string().nullable(),
    ...getPropertiesSchema(),
});

const getProperties = (properties) => {
    return properties
        ? Object.entries(properties).map((p) => {
              return {
                  [NAME]: p[0],
                  [VALUE]: p[1],
                  [PREVIOUS_VALUE]: undefined,
              };
          })
        : null;
};

/**
 * Dialog to modify a substation in the network
 * @param editData the data to edit
 * @param defaultIdValue the default equipment id
 * @param currentNode The node we are currently working on
 * @param studyUuid the study we are currently working on
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */
const SubstationModificationDialog = ({
    editData,
    defaultIdValue,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const emptyFormData = useMemo(
        () => ({
            [EQUIPMENT_ID]: defaultIdValue ?? null,
            [EQUIPMENT_NAME]: '',
            [COUNTRY]: null,
            [ADDITIONAL_PROPERTIES]: null,
        }),
        [defaultIdValue]
    );

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });
    const { reset } = methods;

    useEffect(() => {
        if (editData) {
            reset({
                [EQUIPMENT_ID]: editData.equipmentId,
                [EQUIPMENT_NAME]: editData.equipmentName?.value ?? '',
                [COUNTRY]: editData.substationCountry?.value ?? null,
                [ADDITIONAL_PROPERTIES]: getProperties(editData.properties),
            });
        }
    }, [reset, editData]);

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset, emptyFormData]);

    const onSubmit = useCallback(
        (substation) => {
            modifySubstation(
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
                    headerId: 'SubstationModificationError',
                });
            });
        },
        [currentNodeUuid, editData, snackError, studyUuid]
    );
    return (
        <FormProvider
            validationSchema={schema}
            {...methods}
            removeOptional={true}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-substation"
                maxWidth={'md'}
                titleId="ModifySubstation"
                {...dialogProps}
            >
                <SubstationModificationForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

export default SubstationModificationDialog;
