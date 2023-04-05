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
import {
    controleBusBarSectionLink,
    controleUniqueHorizontalVertical as uniqueHorizontalVerticalControl,
    controleUniqueId as controlUniqueId,
} from './voltage-level-creation-utils';
import { EQUIPMENT_TYPES } from 'components/util/equipment-types';
import { useOpenShortWaitFetching } from '../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';

/**
 * Dialog to create a load in the network
 * @param currentNode The node we are currently working on
 * @param studyUuid the study we are currently working on
 * @param editData the data to edit
 * @param onCreateVoltageLevel to create voltage level from other forms,
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [NOMINAL_VOLTAGE]: '',
    [SUBSTATION_ID]: null,
    [BUS_BAR_SECTIONS]: [],
    [BUS_BAR_CONNECTIONS]: [],
};

const schema = yup.object().shape({
    [EQUIPMENT_ID]: yup.string().required(),
    [EQUIPMENT_NAME]: yup.string(),
    [NOMINAL_VOLTAGE]: yup.string().required(),
    [SUBSTATION_ID]: yup.string().nullable().required(),
    [BUS_BAR_SECTIONS]: yup
        .array()
        .of(
            yup.object().shape({
                [ID]: yup.string().required(),
                [NAME]: yup.string(),
                [HORIZONTAL_POSITION]: yup
                    .number()
                    .min(0)
                    .nullable()
                    .required(),
                [VERTICAL_POSITION]: yup.number().min(0).nullable().required(),
            })
        )
        .min(1, 'EmptyList/bbs')
        .test('unique-positions', (values) =>
            uniqueHorizontalVerticalControl(values, 'SameHorizAndVertPos')
        )
        .test('unique-ids', (values) => controlUniqueId(values, 'DuplicateId')),
    [BUS_BAR_CONNECTIONS]: yup
        .array()
        .of(
            yup.object().shape({
                [FROM_BBS]: yup.string().nullable().required(),
                [TO_BBS]: yup.string().nullable().required(),
                [SWITCH_KIND]: yup.string().nullable().required(),
            })
        )
        .test('bus-bar-section-link', (values) =>
            controleBusBarSectionLink(values, 'DisconnectorBetweenSameBusbar')
        ),
});

const VoltageLevelCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    onCreateVoltageLevel = createVoltageLevel,
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
                    (voltageLevel[EQUIPMENT_ID] ?? voltageLevel[ID]) +
                    (fromCopy ? '(1)' : ''),
                [EQUIPMENT_NAME]:
                    voltageLevel[EQUIPMENT_NAME] ?? voltageLevel[NAME],
                [NOMINAL_VOLTAGE]: voltageLevel[NOMINAL_VOLTAGE],
                [SUBSTATION_ID]: voltageLevel[SUBSTATION_ID],
                [BUS_BAR_SECTIONS]: voltageLevel[BUS_BAR_SECTIONS],
                [BUS_BAR_CONNECTIONS]: voltageLevel[BUS_BAR_CONNECTIONS],
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
            onCreateVoltageLevel({
                studyUuid,
                currentNodeUuid,
                voltageLevelId: voltageLevel[EQUIPMENT_ID],
                voltageLevelName: sanitizeString(voltageLevel[EQUIPMENT_NAME]),
                nominalVoltage: voltageLevel[NOMINAL_VOLTAGE],
                substationId: voltageLevel[SUBSTATION_ID],
                busbarSections: voltageLevel[BUS_BAR_SECTIONS],
                busbarConnections: voltageLevel[BUS_BAR_CONNECTIONS],
                isUpdate: editData ? true : false,
                modificationUuid: editData?.uuid,
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VoltageLevelCreationError',
                });
            });
        },
        [onCreateVoltageLevel, studyUuid, currentNodeUuid, editData, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched: editData,
        delay: FORM_LOADING_DELAY,
    });

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
                open={open}
                isDataFetching={isUpdate && !editData}
                {...dialogProps}
            >
                <VoltageLevelCreationForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    equipmentType={EQUIPMENT_TYPES.VOLTAGE_LEVEL.type}
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
    onCreateVoltageLevel: PropTypes.func,
};

export default VoltageLevelCreationDialog;
