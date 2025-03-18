/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import {
    ADDITIONAL_PROPERTIES,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    EQUIPMENT_NAME,
    ID,
    LOAD_TYPE,
    P0,
    Q0,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import PropTypes from 'prop-types';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { sanitizeString } from '../../../dialog-utils';
import yup from 'components/utils/yup-config';
import ModificationDialog from '../../../commons/modificationDialog';
import LoadModificationForm from './load-modification-form';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import { EQUIPMENT_INFOS_TYPES, EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import { modifyLoad } from '../../../../../services/study/network-modifications';
import { FetchStatus } from '../../../../../services/utils';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import {
    getConnectivityFormData,
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';
import { isNodeBuilt } from '../../../../graph/util/model-functions.ts';

const emptyFormData = {
    [EQUIPMENT_NAME]: '',
    [LOAD_TYPE]: null,
    [P0]: null,
    [Q0]: null,
    ...getConnectivityWithPositionEmptyFormData(true),
    ...emptyProperties,
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_NAME]: yup.string(),
        [LOAD_TYPE]: yup.string().nullable(),
        [P0]: yup.number().nullable(),
        [Q0]: yup.number().nullable(),
        ...getConnectivityWithPositionValidationSchema(true),
    })
    .concat(modificationPropertiesSchema)
    .required();

/**
 * Dialog to create a load in the network
 * @param studyUuid the study we are currently working on
 * @param defaultIdValue the default load id
 * @param currentNode The node we are currently working on
 * @param editData the data to edit
 * @param isUpdate check if edition form
 * @param dialogProps props that are forwarded to the generic ModificationDialog component
 * @param editDataFetchStatus indicates the status of fetching EditData
 */
const LoadModificationDialog = ({
    editData, // contains data when we try to edit an existing hypothesis from the current node's list
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the SLD
    currentNode,
    currentRootNetworkUuid,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const [selectedId, setSelectedId] = useState(defaultIdValue ?? null);
    const [loadToModify, setLoadToModify] = useState(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, getValues, setValue } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (load) => {
            if (load?.equipmentId) {
                setSelectedId(load.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: load.equipmentName?.value ?? '',
                [LOAD_TYPE]: load.loadType?.value ?? null,
                [P0]: load.p0?.value ?? null,
                [Q0]: load.q0?.value ?? null,
                ...getConnectivityFormData({
                    voltageLevelId: load?.voltageLevelId?.value ?? null,
                    busbarSectionId: load?.busOrBusbarSectionId?.value ?? null,
                    connectionName: load?.connectionName?.value ?? '',
                    connectionDirection: load?.connectionDirection?.value ?? null,
                    connectionPosition: load?.connectionPosition?.value ?? null,
                    terminalConnected: load?.terminalConnected?.value ?? null,
                    isEquipmentModification: true,
                }),
                ...getPropertiesFromModification(load.properties),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const onEquipmentIdChange = useCallback(
        (equipmentId) => {
            if (!equipmentId) {
                setLoadToModify(null);
                reset(emptyFormData, { keepDefaultValues: true });
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    currentRootNetworkUuid,
                    EQUIPMENT_TYPES.LOAD,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((load) => {
                        if (load) {
                            setValue(`${CONNECTIVITY}.${VOLTAGE_LEVEL}.${ID}`, load?.voltageLevelId);
                            setValue(`${CONNECTIVITY}.${BUS_OR_BUSBAR_SECTION}.${ID}`, load?.busOrBusbarSectionId);
                            setLoadToModify(load);
                            reset((formValues) => ({
                                ...formValues,
                                [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(load, getValues),
                            }));
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setLoadToModify(null);
                            reset(emptyFormData);
                        }
                    });
            }
        },
        [studyUuid, currentRootNetworkUuid, currentNodeUuid, reset, getValues, setValue, editData]
    );

    useEffect(() => {
        if (selectedId) {
            onEquipmentIdChange(selectedId);
        }
    }, [selectedId, onEquipmentIdChange]);

    const onSubmit = useCallback(
        (load) => {
            modifyLoad({
                studyUuid: studyUuid,
                nodeUuid: currentNodeUuid,
                modificationUuid: editData?.uuid,
                id: selectedId,
                name: sanitizeString(load?.equipmentName),
                loadType: load?.loadType,
                p0: load?.p0,
                q0: load?.q0,
                voltageLevelId: load[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
                busOrBusbarSectionId: load[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
                connectionName: sanitizeString(load[CONNECTIVITY]?.[CONNECTION_NAME]),
                connectionDirection: load[CONNECTIVITY]?.[CONNECTION_DIRECTION],
                connectionPosition: load[CONNECTIVITY]?.[CONNECTION_POSITION],
                terminalConnected: load[CONNECTIVITY]?.[CONNECTED],
                properties: toModificationProperties(load),
            }).catch((error) => {
                snackError({
                    messageTxt: error.message,
                    headerId: 'LoadModificationError',
                });
            });
        },
        [selectedId, editData, studyUuid, currentNodeUuid, snackError]
    );

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            ((editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED) &&
                (dataFetchStatus === FetchStatus.SUCCEED || dataFetchStatus === FetchStatus.FAILED)),
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    return (
        <CustomFormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
            isNodeBuilt={isNodeBuilt(currentNode)}
            isUpdate={isUpdate}
        >
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-load"
                maxWidth={'md'}
                titleId="ModifyLoad"
                open={open}
                keepMounted={true}
                showNodeNotBuiltWarning={selectedId != null}
                isDataFetching={
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {selectedId == null && (
                    <EquipmentIdSelector
                        defaultValue={selectedId}
                        setSelectedId={setSelectedId}
                        equipmentType={EQUIPMENT_TYPES.LOAD}
                        fillerHeight={2}
                    />
                )}
                {selectedId != null && (
                    <LoadModificationForm
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
                        loadToModify={loadToModify}
                        equipmentId={selectedId}
                    />
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

LoadModificationDialog.propTypes = {
    editData: PropTypes.object,
    studyUuid: PropTypes.string,
    currentNode: PropTypes.object,
    isUpdate: PropTypes.bool,
    editDataFetchStatus: PropTypes.string,
};

export default LoadModificationDialog;
