/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    ACTIVE_POWER,
    BUS_BAR_CONNECTIONS,
    BUS_BAR_SECTIONS,
    BUS_OR_BUSBAR_SECTION,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    FROM_BBS,
    HORIZONTAL_POSITION,
    ID,
    LOAD_TYPE,
    NAME,
    NOMINAL_VOLTAGE,
    REACTIVE_POWER,
    SUBSTATION_ID,
    SWITCH_KIND,
    TO_BBS,
    VERTICAL_POSITION,
} from 'components/refactor/utils/field-constants';
import PropTypes from 'prop-types';
import React, { useCallback, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    createLoad,
    createVoltageLevel,
    fetchEquipmentInfos,
} from '../../../../utils/rest-api';
import { sanitizeString } from '../../../dialogs/dialogUtils';
import EquipmentSearchDialog from '../../../dialogs/equipment-search-dialog';
import { useFormSearchCopy } from '../../../dialogs/form-search-copy-hook';
import {
    UNDEFINED_CONNECTION_DIRECTION,
    UNDEFINED_LOAD_TYPE,
} from '../../../network/constants';
import yup from '../../utils/yup-config';
import ModificationDialog from '../commons/modificationDialog';
import {
    getConnectivityEmptyFormData,
    getConnectivityFormData,
    getConnectivityFormValidationSchema,
} from '../connectivity/connectivity-form-utils';
import { getBusBarSectionLineFormData } from './bus-bar-section-line';
import VoltageLevelCreationForm from './voltage-level-creation-form';
import VoltageLevelForm from './voltage-level-creation-form';

/**
 * Dialog to create a load in the network
 * @param currentNodeUuid The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [NOMINAL_VOLTAGE]: '',
    [SUBSTATION_ID]: '',
    [BUS_BAR_SECTIONS]: [
        /*  {
            [ID]: '',
            [NAME]: '',
            [HORIZONTAL_POSITION]: null,
            [VERTICAL_POSITION]: null,
        }, */
    ],
    [BUS_BAR_CONNECTIONS]: [
        //{ [FROM_BBS]: '', [TO_BBS]: '', [SWITCH_KIND]: null },
    ],
};

const schema = yup.object().shape({
    //type: yup.string().required(),
    [EQUIPMENT_ID]: yup.string().required(),
    [EQUIPMENT_NAME]: yup.string().required(),
    [NOMINAL_VOLTAGE]: yup.string().required(),
    [SUBSTATION_ID]: yup.string().required(),
    [BUS_BAR_SECTIONS]: yup.array().of(
        yup.object().shape({
            [ID]: yup.string().required(),
            [NAME]: yup.string().required(),
            [HORIZONTAL_POSITION]: yup.number().required(),
            [VERTICAL_POSITION]: yup.number().required(),
        })
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

    /* const fromSearchCopyToFormValues = (voltageLevel) => {
        fetchEquipmentInfos(
            studyUuid,
            currentNodeUuid,
            'voltage-levels',
            voltageLevel.voltageLevelId,
            true
        ).then((vlResult) => {
            reset({
                [EQUIPMENT_ID]: vlResult.id,
                [EQUIPMENT_NAME]: vlResult.name ?? '',
                [NOMINAL_VOLTAGE]: vlResult.nominalVoltage,
                [SUBSTATION_ID]: vlResult.substationId,
                [BUS_BAR_SECTIONS]: vlResult?.busbarSections ?? [{}, {}],
                ...getBusBarSectionLineFormData({
                    busBarSectionId: vlResult?.busbarSections?.id,
                    busBarSectionName: vlResult?.busbarSections?.name,
                    horizontalPosition: vlResult?.busbarSections?.horizPos,
                    verticalPosition: vlResult?.busbarSections?.vertPos,
                }),
            });
        });
    }; */

    const fromSearchCopyToFormValues = useCallback(
        (voltageLevel) => {
            reset({
                [EQUIPMENT_ID]: voltageLevel.id,
                [EQUIPMENT_NAME]: voltageLevel.name ?? '',
                [NOMINAL_VOLTAGE]: voltageLevel.nominalVoltage,
                [SUBSTATION_ID]: voltageLevel.substationId,
                [BUS_BAR_SECTIONS]: voltageLevel?.busbarSections ?? [{}, {}],
                ...getBusBarSectionLineFormData({
                    busBarSectionId: voltageLevel?.busbarSections?.id,
                    busBarSectionName: voltageLevel?.busbarSections?.name,
                    horizontalPosition: voltageLevel?.busbarSections?.horizPos,
                    verticalPosition: voltageLevel?.busbarSections?.vertPos,
                }),
            });
        },
        [reset]
    );

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
    });

    const fromEditDataToFormValues = useCallback(
        (load) => {
            fetchEquipmentInfos(
                studyUuid,
                currentNodeUuid,
                'voltage-levels',
                load.voltageLevelId,
                true
            )
                .then((vlResult) => {
                    reset({
                        [EQUIPMENT_ID]: load.equipmentId,
                        [EQUIPMENT_NAME]: load.equipmentName ?? '',
                        [LOAD_TYPE]: load.loadType,
                        [ACTIVE_POWER]: load.activePower,
                        [REACTIVE_POWER]: load.reactivePower,
                        ...getConnectivityFormData({
                            voltageLevelId: load.voltageLevelId,
                            voltageLevelTopologyKind: vlResult.topologyKind,
                            voltageLevelName: vlResult.name,
                            voltageLevelNominalVoltage: vlResult.nominalVoltage,
                            voltageLevelSubstationId: vlResult.substationId,
                            busbarSectionId: load.busOrBusbarSectionId,
                            connectionDirection: load.connectionDirection,
                            connectionName: load.connectionName,
                            connectionPosition: load.connectionPosition,
                        }),
                    });
                }) // if voltage level can't be found, we fill the form with minimal infos
                .catch(() => {
                    reset({
                        [EQUIPMENT_ID]: load.equipmentId,
                        [EQUIPMENT_NAME]: load.equipmentName ?? '',
                        [LOAD_TYPE]: load.loadType,
                        [ACTIVE_POWER]: load.activePower,
                        [REACTIVE_POWER]: load.reactivePower,
                        ...getConnectivityFormData({
                            voltageLevelId: load.voltageLevelId,
                            busbarSectionId: load.busOrBusbarSectionId,
                            connectionDirection: load.connectionDirection,
                            connectionName: load.connectionName,
                            connectionPosition: load.connectionPosition,
                        }),
                    });
                });
        },
        [studyUuid, currentNodeUuid, reset]
    );

    /*  const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: (data) => data,
        setFormValues: fromSearchCopyToFormValues,
    }); */

    /*  useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]); */

    const onSubmit = useCallback(
        (voltageLevel) => {
            createVoltageLevel({
                studyUuid,
                currentNodeUuid,
                voltageLevelId: voltageLevel[EQUIPMENT_ID],
                voltageLevelName: sanitizeString(voltageLevel[EQUIPMENT_NAME]),
                nominalVoltage: voltageLevel[NOMINAL_VOLTAGE],
                substationId: voltageLevel[SUBSTATION_ID],
                /*   busbarSections,
                busbarConnections, */
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'VoltageLevelCreationError',
                });
            });
        },
        [/* editData, */ studyUuid, currentNodeUuid, snackError]
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
    currentNodeUuid: PropTypes.string,
};

export default VoltageLevelCreationDialog;
