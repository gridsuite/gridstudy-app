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
    BUS_BAR_COUNT,
    BUS_BAR_SECTION_ID1,
    BUS_BAR_SECTION_ID2,
    COUPLING_OMNIBUS,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HIGH_SHORT_CIRCUIT_CURRENT_LIMIT,
    HIGH_VOLTAGE_LIMIT,
    ID,
    LOW_SHORT_CIRCUIT_CURRENT_LIMIT,
    LOW_VOLTAGE_LIMIT,
    NAME,
    NOMINAL_VOLTAGE,
    SECTION_COUNT,
    SUBSTATION_ID,
    SWITCHES_BETWEEN_SECTIONS,
    SWITCH_KIND,
    SWITCH_KINDS,
} from 'components/utils/field-constants';
import yup from 'components/utils/yup-config';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import ModificationDialog from 'components/dialogs/commons/modificationDialog';

import VoltageLevelCreationForm from './voltage-level-creation-form';
import { controlCouplingOmnibusBetweenSections } from '../voltage-level-creation-utils';
import { useIntl } from 'react-intl';
import { kiloUnitToUnit, unitToKiloUnit } from 'utils/rounding';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { createVoltageLevel } from '../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../utils/rest-api';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';

/**
 * Dialog to create a load in the network
 * @param currentNode The node we are currently working on
 * @param studyUuid the study we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param onCreateVoltageLevel to create voltage level from other forms,
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [SUBSTATION_ID]: null,
    [NOMINAL_VOLTAGE]: null,
    [LOW_VOLTAGE_LIMIT]: null,
    [HIGH_VOLTAGE_LIMIT]: null,
    [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: null,
    [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: null,
    [BUS_BAR_COUNT]: 1,
    [SECTION_COUNT]: 1,
    [SWITCHES_BETWEEN_SECTIONS]: '',
    [COUPLING_OMNIBUS]: [],
    [SWITCH_KINDS]: [],
};

const formSchema = yup.object().shape({
    [EQUIPMENT_ID]: yup.string().required(),
    [EQUIPMENT_NAME]: yup.string().nullable(),
    [SUBSTATION_ID]: yup.string().nullable().required(),
    [NOMINAL_VOLTAGE]: yup.number().nullable().required(),
    [LOW_VOLTAGE_LIMIT]: yup.number().nullable(),
    [HIGH_VOLTAGE_LIMIT]: yup.number().nullable(),
    [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: yup.number().nullable(),
    [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: yup.number().nullable(),
    [BUS_BAR_COUNT]: yup.number().min(1).nullable().required(),
    [SECTION_COUNT]: yup.number().min(1).nullable().required(),
    [SWITCHES_BETWEEN_SECTIONS]: yup
        .string()
        .nullable()
        .when([SECTION_COUNT], {
            is: (sectionCount) => sectionCount > 1,
            then: (schema) => schema.required(),
        }),
    [COUPLING_OMNIBUS]: yup
        .array()
        .of(
            yup.object().shape({
                [BUS_BAR_SECTION_ID1]: yup.string().nullable().required(),
                [BUS_BAR_SECTION_ID2]: yup.string().nullable().required(),
            })
        )
        .test('coupling-omnibus-between-sections', (values) =>
            controlCouplingOmnibusBetweenSections(
                values,
                'CouplingOmnibusBetweenSameBusbar'
            )
        ),
});

const VoltageLevelCreationDialog = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    onCreateVoltageLevel = createVoltageLevel,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError, snackWarning } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;
    const intl = useIntl();

    const fromExternalDataToFormValues = useCallback(
        (voltageLevel, fromCopy = true) => {
            reset({
                [EQUIPMENT_ID]:
                    (voltageLevel[EQUIPMENT_ID] ?? voltageLevel[ID]) +
                    (fromCopy ? '(1)' : ''),
                [EQUIPMENT_NAME]:
                    voltageLevel[EQUIPMENT_NAME] ?? voltageLevel[NAME],
                [SUBSTATION_ID]: voltageLevel[SUBSTATION_ID],
                [NOMINAL_VOLTAGE]: voltageLevel[NOMINAL_VOLTAGE],
                [LOW_VOLTAGE_LIMIT]: voltageLevel[LOW_VOLTAGE_LIMIT],
                [HIGH_VOLTAGE_LIMIT]: voltageLevel[HIGH_VOLTAGE_LIMIT],
                [LOW_SHORT_CIRCUIT_CURRENT_LIMIT]: unitToKiloUnit(
                    voltageLevel.ipMin
                ),
                [HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]: unitToKiloUnit(
                    voltageLevel.ipMax
                ),
                [BUS_BAR_COUNT]: voltageLevel[BUS_BAR_COUNT] ?? 1,
                [SECTION_COUNT]: voltageLevel[SECTION_COUNT] ?? 1,
                [SWITCHES_BETWEEN_SECTIONS]: voltageLevel.switchKinds
                    ?.map((switchKind) => {
                        return intl.formatMessage({ id: switchKind });
                    })
                    .join(' / '),
                [COUPLING_OMNIBUS]: voltageLevel.couplingDevices,
                [SWITCH_KINDS]:
                    voltageLevel.switchKinds != null
                        ? voltageLevel.switchKinds?.map((switchKind) => ({
                              [SWITCH_KIND]: switchKind,
                          }))
                        : [],
            });
            if (voltageLevel.isRetrievedTopology === false) {
                snackWarning({
                    messageId: 'TopologyNotRetrieved',
                });
            }
        },
        [intl, reset, snackWarning]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        toFormValues: (data) => data,
        setFormValues: fromExternalDataToFormValues,
        elementType: EQUIPMENT_TYPES.VOLTAGE_LEVEL.type,
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
                substationId: voltageLevel[SUBSTATION_ID],
                nominalVoltage: voltageLevel[NOMINAL_VOLTAGE],
                lowVoltageLimit: voltageLevel[LOW_VOLTAGE_LIMIT],
                highVoltageLimit: voltageLevel[HIGH_VOLTAGE_LIMIT],
                ipMin: kiloUnitToUnit(
                    voltageLevel[LOW_SHORT_CIRCUIT_CURRENT_LIMIT]
                ),
                ipMax: kiloUnitToUnit(
                    voltageLevel[HIGH_SHORT_CIRCUIT_CURRENT_LIMIT]
                ),
                busbarCount: voltageLevel[BUS_BAR_COUNT],
                sectionCount: voltageLevel[SECTION_COUNT],
                switchKinds: voltageLevel[SWITCH_KINDS].map((e) => {
                    return e.switchKind;
                }),
                couplingDevices: voltageLevel[COUPLING_OMNIBUS],
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
                aria-labelledby="dialog-create-voltage-level"
                maxWidth={'md'}
                titleId="CreateVoltageLevel"
                searchCopy={searchCopy}
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
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
    isUpdate: PropTypes.bool,
    onCreateVoltageLevel: PropTypes.func,
    editDataFetchStatus: PropTypes.string,
};

export default VoltageLevelCreationDialog;
