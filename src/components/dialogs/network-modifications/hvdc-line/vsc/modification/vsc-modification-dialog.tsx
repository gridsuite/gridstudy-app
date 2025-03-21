/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import ModificationDialog from '../../../../commons/modificationDialog';
import { EquipmentIdSelector } from '../../../../equipment-id/equipment-id-selector';
import { EQUIPMENT_INFOS_TYPES } from 'components/utils/equipment-types';
import { sanitizeString } from '../../../../dialog-utils';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import {
    ACTIVE_POWER_SETPOINT,
    ADDITIONAL_PROPERTIES,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTERS_MODE,
    DROOP,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
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
} from '../../../../../utils/field-constants';
import { FetchStatus } from '../../../../../../services/utils';
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
} from '../converter-station/converter-station-utils';
import { VscModificationForm } from './vsc-modification-from';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { modifyVsc } from 'services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../../services/study/network';
import { VscModificationInfo } from 'services/network-modification-types';
import {
    REMOVE,
    setCurrentReactiveCapabilityCurveTable,
    setSelectedReactiveLimits,
} from 'components/dialogs/reactive-limits/reactive-capability-curve/reactive-capability-utils';
import { CustomFormProvider, ExtendedEquipmentType, useSnackMessage } from '@gridsuite/commons-ui';
import {
    emptyProperties,
    getConcatenatedProperties,
    getPropertiesFromModification,
    modificationPropertiesSchema,
    toModificationProperties,
} from '../../../common/properties/property-utils';
import { isNodeBuilt } from '../../../../../graph/util/model-functions';
import { ReactiveCapabilityCurvePoints } from '../../../../reactive-limits/reactive-limits.type';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().nullable(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        ...getVscHvdcLineModificationPaneSchema(HVDC_LINE_TAB),
        ...getVscConverterStationModificationSchema(CONVERTER_STATION_1),
        ...getVscConverterStationModificationSchema(CONVERTER_STATION_2),
    })
    .concat(modificationPropertiesSchema)
    .required();
const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getVscHvdcLinePaneEmptyFormData(HVDC_LINE_TAB, true),
    ...getVscConverterStationEmptyFormData(CONVERTER_STATION_1, true),
    ...getVscConverterStationEmptyFormData(CONVERTER_STATION_2, true),
    ...emptyProperties,
};

const VSC_MODIFICATION_TABS = {
    HVDC_LINE_TAB: 0,
    CONVERTER_STATION_1: 1,
    CONVERTER_STATION_2: 2,
};

const VscModificationDialog: React.FC<any> = ({
    editData,
    defaultIdValue, // Used to pre-select an equipmentId when calling this dialog from the network map or spreadsheet
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const [tabIndex, setTabIndex] = useState(VSC_MODIFICATION_TABS.HVDC_LINE_TAB);

    const [equipmentId, setEquipmentId] = useState<string | null>(defaultIdValue ?? null);
    const [vscToModify, setVscToModify] = useState<VscModificationInfo | null>(null);
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    const { snackError } = useSnackMessage();
    const { reset, getValues, setValue, handleSubmit } = formMethods;

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });
    const fromEditDataToFormValues = useCallback(
        (editData: any) => {
            if (editData?.equipmentId) {
                setEquipmentId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData?.equipmentName?.value ?? '',
                ...getVscHvdcLineModificationTabFormData(HVDC_LINE_TAB, editData),
                ...getConverterStationModificationFormEditData(CONVERTER_STATION_1, editData.converterStation1),
                ...getConverterStationModificationFormEditData(CONVERTER_STATION_2, editData.converterStation2),
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
            reset({ ...emptyFormData, ...customData }, { keepDefaultValues: keepDefaultValues });
        },
        [reset]
    );

    const onEquipmentIdChange = useCallback(
        (equipmentId: string | null) => {
            if (!equipmentId) {
                setValuesAndEmptyOthers();
                setVscToModify(null);
            } else {
                setDataFetchStatus(FetchStatus.RUNNING);
                fetchNetworkElementInfos(
                    studyUuid,
                    currentNode.id,
                    currentRootNetworkUuid,
                    ExtendedEquipmentType.HVDC_LINE_VSC,
                    EQUIPMENT_INFOS_TYPES.FORM.type,
                    equipmentId,
                    true
                )
                    .then((value: any) => {
                        if (value) {
                            // when editing modification form, first render should not trigger this reset
                            // which would empty the form instead of displaying data of existing form

                            const previousReactiveCapabilityCurveTable1 =
                                value.converterStation1?.reactiveCapabilityCurvePoints;
                            if (previousReactiveCapabilityCurveTable1) {
                                setCurrentReactiveCapabilityCurveTable(
                                    previousReactiveCapabilityCurveTable1,
                                    `${CONVERTER_STATION_1}.${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
                                    getValues,
                                    setValue,
                                    isNodeBuilt(currentNode)
                                );
                            }

                            const previousReactiveCapabilityCurveTable2 =
                                value.converterStation2?.reactiveCapabilityCurvePoints;
                            if (previousReactiveCapabilityCurveTable2) {
                                setCurrentReactiveCapabilityCurveTable(
                                    previousReactiveCapabilityCurveTable2,
                                    `${CONVERTER_STATION_2}.${REACTIVE_LIMITS}.${REACTIVE_CAPABILITY_CURVE_TABLE}`,
                                    getValues,
                                    setValue,
                                    isNodeBuilt(currentNode)
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
                            setVscToModify({
                                ...value,
                                converterStation1: {
                                    ...value.converterStation1,
                                    reactiveCapabilityCurveTable: previousReactiveCapabilityCurveTable1,
                                },
                                converterStation2: {
                                    ...value.converterStation2,
                                    reactiveCapabilityCurveTable: previousReactiveCapabilityCurveTable2,
                                },
                            });
                            reset((formValues) => ({
                                ...formValues,
                                [ADDITIONAL_PROPERTIES]: getConcatenatedProperties(value, getValues),
                            }));
                        }
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch(() => {
                        setDataFetchStatus(FetchStatus.FAILED);
                        if (editData?.equipmentId !== equipmentId) {
                            setVscToModify(null);
                            reset(emptyFormData);
                        }
                    });
            }
        },
        [
            setValuesAndEmptyOthers,
            currentRootNetworkUuid,
            studyUuid,
            currentNode,
            setValue,
            reset,
            getValues,
            editData?.equipmentId,
        ]
    );

    useEffect(() => {
        if (equipmentId) {
            onEquipmentIdChange(equipmentId);
        }
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

        modifyVsc({
            studyUuid: studyUuid,
            nodeUuid: currentNode.id,
            id: equipmentId,
            name: sanitizeString(hvdcLine[EQUIPMENT_NAME]),
            nominalV: hvdcLineTab[NOMINAL_V],
            r: hvdcLineTab[R],
            maxP: hvdcLineTab[MAX_P],
            operatorActivePowerLimitSide1: hvdcLineTab[OPERATOR_ACTIVE_POWER_LIMIT_SIDE1],
            operatorActivePowerLimitSide2: hvdcLineTab[OPERATOR_ACTIVE_POWER_LIMIT_SIDE2],
            convertersMode: hvdcLineTab[CONVERTERS_MODE],
            activePowerSetpoint: hvdcLineTab[ACTIVE_POWER_SETPOINT],
            angleDroopActivePowerControl: hvdcLineTab[ANGLE_DROOP_ACTIVE_POWER_CONTROL],
            p0: hvdcLineTab[P0],
            droop: hvdcLineTab[DROOP],
            converterStation1: converterStation1,
            converterStation2: converterStation2,
            properties: toModificationProperties(hvdcLine),
            isUpdate: !!editData,
            modificationUuid: editData?.uuid ?? null,
        }).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'VscModificationError',
            });
        });
    };

    const updateConverterStationCapabilityCurveTable = (
        newRccValues: ReactiveCapabilityCurvePoints[] | undefined,
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
        setVscToModify((previousValue: VscModificationInfo | null) => {
            const newRccValues = previousValue?.[converterStationName]?.reactiveCapabilityCurveTable;
            return updateConverterStationCapabilityCurveTable(newRccValues, action, index, previousValue);
        });
    };

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
                    isUpdate && (editDataFetchStatus === FetchStatus.RUNNING || dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {equipmentId === null && (
                    <EquipmentIdSelector
                        defaultValue={equipmentId}
                        setSelectedId={setEquipmentId}
                        equipmentType={ExtendedEquipmentType.HVDC_LINE_VSC}
                        fillerHeight={17}
                    />
                )}
                {equipmentId !== null && (
                    <VscModificationForm
                        tabIndex={tabIndex}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        currentRootNetworkUuid={currentRootNetworkUuid}
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
