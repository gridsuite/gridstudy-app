/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { sanitizeString } from 'components/dialogs/dialogUtils';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from 'components/dialogs/form-search-copy-hook';
import {
    BUS_BAR_CONNECTIONS,
    BUS_BAR_SECTIONS,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FROM_BBS,
    HORIZONTAL_POSITION,
    ID,
    NAME,
    NOMINAL_VOLTAGE,
    SUBSTATION_ID,
    SWITCH_KIND,
    TO_BBS,
    VERTICAL_POSITION,
} from 'components/refactor/utils/field-constants';
import yup from 'components/refactor/utils/yup-config';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { createVoltageLevel } from 'utils/rest-api';
import ModificationDialog from 'components/refactor/dialogs/commons/modificationDialog';

import VoltageLevelCreationForm from './voltage-level-creation-form';

/**
 * Dialog to create a load in the network
 * @param currentNode The node we are currently working on
 * @param studyUuid the study we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [NOMINAL_VOLTAGE]: '',
    [SUBSTATION_ID]: '',
    [BUS_BAR_SECTIONS]: [],
    [BUS_BAR_CONNECTIONS]: [],
};

const schema = yup.object().shape({
    [EQUIPMENT_ID]: yup.string().required(),
    [EQUIPMENT_NAME]: yup.string(),
    [NOMINAL_VOLTAGE]: yup.string().required(),
    [SUBSTATION_ID]: yup.string().required(),
    [BUS_BAR_SECTIONS]: yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string(),
            [HORIZONTAL_POSITION]: yup.number().required().default(1),
            [VERTICAL_POSITION]: yup.number().required().default(1),
        })
        // .unique('duplicate id', (a) => a.id)
    ),
    [BUS_BAR_CONNECTIONS]: yup.array().of(
        yup.object().shape({
            [FROM_BBS]: yup.string().required(),
            [TO_BBS]: yup.string().required(),
            [SWITCH_KIND]: yup.string().required(),
        })
    ),
});

const VoltageLevelCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const equipmentPath = 'voltage-levels';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    const fromExternalDataToFormValues = useCallback(
        (voltageLevel, fromCopy = true) => {
            reset({
                [EQUIPMENT_ID]:
                    (voltageLevel?.equipmentId ?? voltageLevel?.id) +
                    (fromCopy ? '(1)' : ''),
                [EQUIPMENT_NAME]:
                    voltageLevel?.equipmentName ?? voltageLevel?.name,
                [NOMINAL_VOLTAGE]: voltageLevel.nominalVoltage,
                [SUBSTATION_ID]: voltageLevel.substationId,
                [BUS_BAR_SECTIONS]: voltageLevel?.busbarSections ?? [],
                [BUS_BAR_CONNECTIONS]: voltageLevel?.busbarConnections ?? [],
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: (data) => data,
        setFormValues: fromExternalDataToFormValues,
    });

    useEffect(() => {
        if (editData) {
            fromExternalDataToFormValues(editData, false);
        }
    }, [fromExternalDataToFormValues, editData]);

    const onSubmit = useCallback(
        (voltageLevel) => {
            createVoltageLevel({
                studyUuid,
                currentNodeUuid,
                voltageLevelId: voltageLevel[EQUIPMENT_ID],
                voltageLevelName: sanitizeString(voltageLevel[EQUIPMENT_NAME]),
                nominalVoltage: voltageLevel[NOMINAL_VOLTAGE],
                substationId: voltageLevel[SUBSTATION_ID],
                busbarSections: voltageLevel?.busbarSections,
                busbarConnections: voltageLevel?.busbarConnections,
                isUpdate: editData ? true : false,
                modificationUuid: editData?.uuid,
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VoltageLevelCreationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-voltage-level"
                maxWidth={'md'}
                titleId="CreateVoltageLevel"
                searchCopy={searchCopy}
                {...dialogProps}
            >
                <VoltageLevelCreationForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={'VOLTAGE_LEVEL'}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    currentNodeUuid={currentNodeUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

VoltageLevelCreationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
};

export default VoltageLevelCreationDialog;
