/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    BUS_BAR_SECTION_ID,
    LINE_TO_ATTACH_TO_ID_1,
    LINE_TO_ATTACH_TO_ID_2,
    REMPLACING_LINE_ID_1,
    REMPLACING_LINE_ID_2,
    REMPLACING_LINE_NAME_1,
    REMPLACING_LINE_NAME_2,
    TYPE,
    VOLTAGE_LEVEL_ID,
} from 'components/refactor/utils/field-constants';
import React, { useCallback } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { createLoad } from '../../../../utils/rest-api';
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
import LinesAttachToSplitLinesForm from './lines-attach-to-split-lines-form';

/**
 * Dialog to create a load in the network
 * @param studyUuid the study we are currently working on
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 */

const emptyFormData = {
    [LINE_TO_ATTACH_TO_ID_1]: '',
    [LINE_TO_ATTACH_TO_ID_2]: '',
    [TYPE]: null,
    [VOLTAGE_LEVEL_ID]: null,
    [BUS_BAR_SECTION_ID]: null,
    [REMPLACING_LINE_ID_1]: null,
    [REMPLACING_LINE_NAME_1]: null,
    [REMPLACING_LINE_ID_2]: null,
    [REMPLACING_LINE_NAME_2]: null,
};

const schema = yup
    .object()
    .shape({
        [LINE_TO_ATTACH_TO_ID_1]: yup.string().required(),
        [LINE_TO_ATTACH_TO_ID_2]: yup.string().required(),
        [TYPE]: yup.string(),
        [VOLTAGE_LEVEL_ID]: yup.string().required(),
        [BUS_BAR_SECTION_ID]: yup.string().required(),
        [REMPLACING_LINE_ID_1]: yup.string().required(),
        [REMPLACING_LINE_NAME_1]: yup.string(),
        [REMPLACING_LINE_ID_2]: yup.string().required(),
        [REMPLACING_LINE_NAME_2]: yup.string(),
    })
    .required();

const LinesAttachToSplitLinesDialog = ({
    editData,
    currentNode,
    studyUuid,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();

    const equipmentPath = 'loads';

    const methods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(schema),
    });

    const { reset } = methods;

    /*  const fromSearchCopyToFormValues = (load) => {
        fetchEquipmentInfos(
            studyUuid,
            currentNodeUuid,
            'voltage-levels',
            load.voltageLevelId,
            true
        ).then((vlResult) => {
            reset({
                [EQUIPMENT_ID]: load.id + '(1)',
                [EQUIPMENT_NAME]: load.name ?? '',
                [LOAD_TYPE]: load.type,
                [ACTIVE_POWER]: load.p0,
                [REACTIVE_POWER]: load.q0,
                ...getConnectivityFormData({
                    voltageLevelId: load.voltageLevelId,
                    busbarSectionId: load.busOrBusbarSectionId,
                    voltageLevelTopologyKind: vlResult.topologyKind,
                    voltageLevelName: vlResult.name,
                    voltageLevelNominalVoltage: vlResult.nominalVoltage,
                    voltageLevelSubstationId: vlResult.substationId,
                    connectionDirection: load.connectionDirection,
                    connectionName: load.connectionName,
                    connectionPosition: load.connectionPosition,
                }),
            });
        });
    };

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
    ); */

    const searchCopy = useFormSearchCopy({
        studyUuid,
        currentNodeUuid,
        equipmentPath,
        toFormValues: (data) => data,
        // setFormValues: fromSearchCopyToFormValues,
    });

    /*   useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]); */

    /*  const onSubmit = useCallback(
        (load) => {
            createLoad(
                studyUuid,
                currentNodeUuid,
                load[EQUIPMENT_ID],
                sanitizeString(load[EQUIPMENT_NAME]),
                !load[LOAD_TYPE] ? UNDEFINED_LOAD_TYPE : load[LOAD_TYPE],
                load[ACTIVE_POWER],
                load[REACTIVE_POWER],
                load.connectivity.voltageLevel.id,
                load.connectivity.busOrBusbarSection.id,
                editData ? true : false,
                editData ? editData.uuid : undefined,
                load.connectivity?.connectionDirection ??
                    UNDEFINED_CONNECTION_DIRECTION,
                load.connectivity?.connectionName ?? null,
                load.connectivity?.connectionPosition ?? null
            ).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LoadCreationError',
                });
            });
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    ); */

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <FormProvider validationSchema={schema} {...methods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                //onSave={onSubmit}
                aria-labelledby="dialog-create-load"
                maxWidth={'md'}
                titleId="CreateLoad"
                //searchCopy={searchCopy}
                {...dialogProps}
            >
                <LinesAttachToSplitLinesForm
                    currentNode={currentNode}
                    studyUuid={studyUuid}
                />
            </ModificationDialog>
        </FormProvider>
    );
};

/* LinesAttachToSplitLinesDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
};
 */
export default LinesAttachToSplitLinesDialog;
