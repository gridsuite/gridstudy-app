/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../../equipment-id/equipment-id-selector';
import {
    EQUIPMENT_INFOS_TYPES,
    EQUIPMENT_TYPES,
} from 'components/utils/equipment-types';
import { sanitizeString } from '../../../dialogUtils';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    ACTIVE_POWER_SETPOINT,
    ADDITIONAL_PROPERTIES,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    BUS_OR_BUSBAR_SECTION,
    CONNECTED,
    CONNECTION_DIRECTION,
    CONNECTION_NAME,
    CONNECTION_POSITION,
    CONNECTIVITY,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTERS_MODE,
    DROOP,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
    ID,
    MAX_P,
    MAX_Q,
    MIN_Q,
    NOMINAL_V,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE1,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE2,
    P,
    P0,
    R,
    REACTIVE_CAPABILITY_CURVE_CHOICE,
    REACTIVE_CAPABILITY_CURVE_TABLE,
    REACTIVE_LIMITS,
    VOLTAGE_LEVEL,
} from '../../../../utils/field-constants';
import { FetchStatus } from '../../../../../services/utils';
import {
    getVscHvdcLineModificationPaneSchema,
    getVscHvdcLineModificationTabFormData,
    getVscHvdcLinePaneEmptyFormData,
} from '../hvdc-line-pane/vsc-hvdc-line-pane-utils';
import {
    getConverterStationModificationData,
    getConverterStationModificationFormEditData,
    getVscConverterStationEmptyFormData,
    getVscConverterStationModificationSchema,
    ReactiveCapabilityCurvePointsData,
} from '../converter-station/converter-station-utils';
import { VscModificationForm } from './vsc-modification-from';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import {
    FORM_LOADING_DELAY,
    UNDEFINED_CONNECTION_DIRECTION,
} from 'components/network/constants';
import { modifyVsc } from 'services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { VscModificationInfo } from 'services/network-modification-types';
import {
    REMOVE,
    setCurrentReactiveCapabilityCurveTable,
    setSelectedReactiveLimits,
} from 'components/dialogs/reactive-limits/reactive-capability-curve/reactive-capability-utils';
import { CustomFormProvider, useSnackMessage } from '@gridsuite/commons-ui';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../common/properties/property-utils';
import {
    getConnectivityWithPositionEmptyFormData,
    getConnectivityWithPositionValidationSchema,
} from '../../../connectivity/connectivity-form-utils';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().nullable(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        ...getConnectivityWithPositionValidationSchema(),
        ...getVscHvdcLineModificationPaneSchema(HVDC_LINE_TAB),
        ...getVscConverterStationModificationSchema(CONVERTER_STATION_1),
        ...getVscConverterStationModificationSchema(CONVERTER_STATION_2),
    })
    .concat(modificationPropertiesSchema)
    .required();
const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getConnectivityWithPositionEmptyFormData(),
    ...getVscHvdcLinePaneEmptyFormData(HVDC_LINE_TAB, true),
    ...getVscConverterStationEmptyFormData(CONVERTER_STATION_1, true),
    ...getVscConverterStationEmptyFormData(CONVERTER_STATION_2, true),
    ...emptyProperties,
};

export const VSC_MODIFICATION_TABS = {
    HVDC_LINE_TAB: 0,
    CONVERTER_STATION_1: 1,
    CONVERTER_STATION_2: 2,
};

const VscModificationDialog: React.FC<any> = ({
    editData,
    currentNode,
    studyUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode.id;
    const [tabIndex, setTabIndex] = useState(
        VSC_MODIFICATION_TABS.HVDC_LINE_TAB
    );

    const [equipmentId, setEquipmentId] = useState<string | null>(null); // add defaultIdValue to preselect an equipment ? see GeneratorModificationDialog for an example
    const [vscToModify, setVcsToModify] = useState<VscModificationInfo | null>(
        null
    );
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { snackError } = useSnackMessage();
    const { reset, getValues, setValue, handleSubmit } = formMethods;

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    const fromEditDataToFormValues = useCallback(
        (editData: any) => {
            if (editData?.equipmentId) {
                setEquipmentId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
                ...getVscHvdcLineModificationTabFormData(
                    HVDC_LINE_TAB,
                    editData
                ),
                ...getConverterStationModificationFormEditData(
                    CONVERTER_STATION_1,
                    editData.converterStation1
                ),
                ...getConverterStationModificationFormEditData(
                    CONVERTER_STATION_2,
                    editData.converterStation2
                ),
                ...getPropertiesFromModification(editData.properties),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    //this method empties the form, and let us pass custom data that we want to set
    const setValuesAndEmptyOthers = useCallback(
        (customData = {}, keepDefaultValues = false) => {
            reset(
                { ...emptyFormData, ...customData },
                { keepDefaultValues: keepDefaultValues }
            );
        },
        [reset]
    );

    const onEquipmentIdChange = useCallback(
        (equipementId: string | null) => {
            if (equipementId) {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNodeUuid,
                    EQUIPMENT_TYPES.HVDC_LINE,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipementId,
                    true
                )
                    .then((value: any) => {
                        const previousReactiveCapabilityCurveTable1 =
                            value?.converterStation1
                                ?.reactiveCapabilityCurvePoints;
                        if (previousReactiveCapabilityCurveTable1) {
                            setCurrentReactiveCapabilityCurveTable(
                                previousReactiveCapabilityCurveTable1,
                                `${CONVERTER_STATION_1}.${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
                                getValues,
                                setValue
                            );
                        }

                        const previousReactiveCapabilityCurveTable2 =
                            value?.converterStation2
                                ?.reactiveCapabilityCurvePoints;
                        if (previousReactiveCapabilityCurveTable2) {
                            setCurrentReactiveCapabilityCurveTable(
                                previousReactiveCapabilityCurveTable2,
                                `${CONVERTER_STATION_2}.${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
                                getValues,
                                setValue
                            );
                        }

                        setSelectedReactiveLimits(
                            `${CONVERTER_STATION_1}.${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_CHOICE}`,
                            value.converterStation1?.minMaxReactiveLimits,
                            setValue
                        );
                        setSelectedReactiveLimits(
                            `${CONVERTER_STATION_2}.${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_CHOICE}`,
                            value.converterStation2?.minMaxReactiveLimits,
                            setValue
                        );

                        setVcsToModify({
                            ...value,
                            converterStation1: {
                                ...value.converterStation1,
                                reactiveCapabilityCurveTable:
                                    previousReactiveCapabilityCurveTable1,
                            },
                            converterStation2: {
                                ...value.converterStation2,
                                reactiveCapabilityCurveTable:
                                    previousReactiveCapabilityCurveTable2,
                            },
                        });
                        reset((formValues) => ({
                            ...formValues,
                            [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(
                                value,
                                getValues
                            ),
                        }));
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch((_error) => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        setVcsToModify(null);
                        reset(emptyFormData);
                    });
            } else {
                setValuesAndEmptyOthers();
                setVcsToModify(null);
            }
        },
        [
            studyUuid,
            currentNodeUuid,
            setValue,
            getValues,
            reset,
            setValuesAndEmptyOthers,
        ]
    );
    useEffect(() => {
        onEquipmentIdChange(equipmentId);
    }, [equipmentId, onEquipmentIdChange]);

    const onSubmit = (hvdcLine: any) => {
        const hvdcLineTab = hvdcLine[HVDC_LINE_TAB];
        const converterStation1 = getConverterStationModificationData(
            hvdcLine[CONVERTER_STATION_1],
            vscToModify?.converterStation1
        );
        const converterStation2 = getConverterStationModificationData(
            hvdcLine[CONVERTER_STATION_2],
            vscToModify?.converterStation2
        );

        modifyVsc(
            studyUuid,
            currentNode.id,
            equipmentId,
            sanitizeString(hvdcLine[EQUIPMENT_NAME]),
            hvdcLineTab[NOMINAL_V],
            hvdcLineTab[R],
            hvdcLineTab[MAX_P],
            hvdcLineTab[OPERATOR_ACTIVE_POWER_LIMIT_SIDE1],
            hvdcLineTab[OPERATOR_ACTIVE_POWER_LIMIT_SIDE2],
            hvdcLineTab[CONVERTERS_MODE],
            hvdcLineTab[ACTIVE_POWER_SETPOINT],
            hvdcLineTab[ANGLE_DROOP_ACTIVE_POWER_CONTROL],
            hvdcLineTab[P0],
            hvdcLineTab[DROOP],
            converterStation1,
            converterStation2,
            toModificationProperties(hvdcLine),
            !!editData,
            editData?.uuid ?? null,
            hvdcLineTab[CONNECTIVITY]?.[VOLTAGE_LEVEL]?.[ID],
            hvdcLineTab[CONNECTIVITY]?.[BUS_OR_BUSBAR_SECTION]?.[ID],
            sanitizeString(hvdcLineTab[CONNECTIVITY]?.[CONNECTION_NAME]),
            hvdcLineTab[CONNECTIVITY]?.[CONNECTION_DIRECTION] ??
                UNDEFINED_CONNECTION_DIRECTION,
            hvdcLineTab[CONNECTIVITY]?.[CONNECTION_POSITION],
            hvdcLineTab[CONNECTIVITY]?.[CONNECTED]
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'VscModificationError',
            });
        });
    };

    const updateConverterStationCapabilityCurveTable = (
        newRccValues: ReactiveCapabilityCurvePointsData[] | undefined,
        action: string,
        index: number,
        previousValue: VscModificationInfo | null
    ): any => {
        if (!newRccValues) {
            return previousValue;
        }
        action === REMOVE
            ? newRccValues.splice(index, 1)
            : newRccValues.splice(index, 0, {
                  [P]: null,
                  [MIN_Q]: null,
                  [MAX_Q]: null,
              });
        return {
            ...previousValue,
            reactiveCapabilityCurveTable: newRccValues,
        };
    };

    const updatePreviousReactiveCapabilityCurveTableConverterStation = (
        action: string,
        index: number,
        converterStationName: 'converterStation1' | 'converterStation2'
    ) => {
        setVcsToModify((previousValue: VscModificationInfo | null) => {
            const newRccValues =
                previousValue?.[converterStationName]
                    ?.reactiveCapabilityCurveTable;
            return updateConverterStationCapabilityCurveTable(
                newRccValues,
                action,
                index,
                previousValue
            );
        });
    };

    return (
        <CustomFormProvider
            validationSchema={formSchema}
            removeOptional={true}
            {...formMethods}
        >
            <ModificationDialog
                fullWidth
                onClear={setValuesAndEmptyOthers}
                onSave={handleSubmit(onSubmit)}
                aria-labelledby="dialog-modify-vsc"
                maxWidth={'md'}
                titleId="ModifyVsc"
                PaperProps={{
                    sx: {
                        height: '95vh', // we want the dialog height to be fixed even when switching tabs
                    },
                }}
                open={open}
                keepMounted={true}
                showNodeNotBuiltWarning={equipmentId != null}
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {equipmentId === null && (
                    <EquipmentIdSelector
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultValue={equipmentId}
                        setSelectedId={setEquipmentId}
                        equipmentType={EQUIPMENT_TYPES.HVDC_LINE}
                        fillerHeight={17}
                    />
                )}
                {equipmentId !== null && (
                    <VscModificationForm
                        tabIndex={tabIndex}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        equipmentId={equipmentId}
                        setTabIndex={setTabIndex}
                        vscToModify={vscToModify}
                        tabIndexesWithError={[]}
                        updatePreviousReactiveCapabilityCurveTableConverterStation={
                            updatePreviousReactiveCapabilityCurveTableConverterStation
                        }
                    ></VscModificationForm>
                )}
            </ModificationDialog>
        </CustomFormProvider>
    );
};

export default VscModificationDialog;
