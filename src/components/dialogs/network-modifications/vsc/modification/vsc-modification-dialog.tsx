import React, { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
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
    ACTIVE_POWER,
    ANGLE_DROOP_ACTIVE_POWER_CONTROL,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTERS_MODE,
    DC_NOMINAL_VOLTAGE,
    DC_RESISTANCE,
    DROOP,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
    MAXIMUM_ACTIVE_POWER,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE1,
    OPERATOR_ACTIVE_POWER_LIMIT_SIDE2,
    P0,
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
} from '../converter-station/converter-station-utils';
import { VscModificationForm } from './vsc-modification-from';
import { useOpenShortWaitFetching } from 'components/dialogs/commons/handle-modification-form';
import { FORM_LOADING_DELAY } from 'components/network/constants';
import { modifyVsc } from 'services/study/network-modifications';
import { fetchNetworkElementInfos } from '../../../../../services/study/network';
import { VscModificationInfo } from 'services/network-modification-types';

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().nullable(),
        [EQUIPMENT_NAME]: yup.string().nullable(),
        ...getVscHvdcLineModificationPaneSchema(HVDC_LINE_TAB),
        ...getVscConverterStationModificationSchema(CONVERTER_STATION_1),
        ...getVscConverterStationModificationSchema(CONVERTER_STATION_2),
    })
    .required();
const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getVscHvdcLinePaneEmptyFormData(HVDC_LINE_TAB, true),
    ...getVscConverterStationEmptyFormData(CONVERTER_STATION_1, true),
    ...getVscConverterStationEmptyFormData(CONVERTER_STATION_2, true),
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

    const [equipementId, setEquipementId] = useState<string | null>(null); // add defaultIdValue to preselect an equipment ? see GeneratorModificationDialog for an example
    const [vscInfos, setVcsToModify] = useState<VscModificationInfo | null>(
        null
    );
    const [dataFetchStatus, setDataFetchStatus] = useState(FetchStatus.IDLE);
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

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
                setEquipementId(editData.equipmentId);
            }
            reset({
                [EQUIPMENT_NAME]: editData?.equipmentName ?? '',
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
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData); //FIXME (jamal): uncomment this line
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
                    .then((value: VscModificationInfo) => {
                        setVcsToModify(value);
                        setDataFetchStatus(FetchStatus.SUCCEED);
                    })
                    .catch((_) => {
                        setVcsToModify(null);
                        setDataFetchStatus(FetchStatus.FAILED);
                    });
            } else {
                setValuesAndEmptyOthers();
                setVcsToModify(null);
            }
        },
        [studyUuid, currentNodeUuid, setValuesAndEmptyOthers]
    );
    useEffect(() => {
        if (equipementId) {
            onEquipmentIdChange(equipementId);
        }
    }, [equipementId, onEquipmentIdChange]);

    const onSubmit = (hvdcLine: any) => {
        const hvdcLineTab = hvdcLine[HVDC_LINE_TAB];
        const converterStation1 = getConverterStationModificationData(
            hvdcLine[CONVERTER_STATION_1],
            vscInfos?.converterStation1
        );
        const converterStation2 = getConverterStationModificationData(
            hvdcLine[CONVERTER_STATION_2],
            vscInfos?.converterStation2
        );
        modifyVsc(
            studyUuid,
            currentNode.id,
            equipementId,
            sanitizeString(hvdcLine[EQUIPMENT_NAME]),
            hvdcLineTab[DC_NOMINAL_VOLTAGE],
            hvdcLineTab[DC_RESISTANCE],
            hvdcLineTab[MAXIMUM_ACTIVE_POWER],
            hvdcLineTab[OPERATOR_ACTIVE_POWER_LIMIT_SIDE1],
            hvdcLineTab[OPERATOR_ACTIVE_POWER_LIMIT_SIDE2],
            hvdcLineTab[CONVERTERS_MODE],
            hvdcLineTab[ACTIVE_POWER],
            hvdcLineTab[ANGLE_DROOP_ACTIVE_POWER_CONTROL],
            hvdcLineTab[P0],
            hvdcLineTab[DROOP],
            converterStation1,
            converterStation2,
            !!editData,
            editData?.uuid ?? null
        ).catch((error) => {
            snackError({
                messageTxt: error.message,
                headerId: 'VscModificationError',
            });
        });
    };

    return (
        <FormProvider
            {...{
                validationSchema: formSchema,
                ...formMethods,
            }}
        >
            <ModificationDialog
                fullWidth
                onClear={setValuesAndEmptyOthers}
                onSave={onSubmit}
                onValidationError={() => {}}
                onValidated={() => {}}
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
                showNodeNotBuiltWarning={equipementId != null}
                isDataFetching={
                    isUpdate &&
                    (editDataFetchStatus === FetchStatus.RUNNING ||
                        dataFetchStatus === FetchStatus.RUNNING)
                }
                {...dialogProps}
            >
                {equipementId === null && (
                    <EquipmentIdSelector
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        defaultValue={equipementId}
                        setSelectedId={setEquipementId}
                        equipmentType={EQUIPMENT_TYPES.HVDC_LINE}
                        fillerHeight={17}
                    />
                )}
                {equipementId !== null && (
                    <VscModificationForm
                        tabIndex={tabIndex}
                        studyUuid={studyUuid}
                        currentNode={currentNode}
                        equipmentId={equipementId}
                        setTabIndex={setTabIndex}
                        vscInfos={vscInfos}
                        tabIndexesWithError={[]}
                    ></VscModificationForm>
                )}
            </ModificationDialog>
        </FormProvider>
    );
};

export default VscModificationDialog;
function snackError(arg0: { messageTxt: any; headerId: string }) {
    throw new Error('Function not implemented.\n' + arg0.messageTxt);
}
