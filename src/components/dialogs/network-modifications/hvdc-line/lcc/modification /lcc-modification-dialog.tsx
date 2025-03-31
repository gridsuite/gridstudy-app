import {
    ACTIVE_POWER_SETPOINT,
    ADDITIONAL_PROPERTIES,
    CONVERTER_STATION_1,
    CONVERTER_STATION_2,
    CONVERTER_STATION_ID,
    CONVERTER_STATION_NAME,
    CONVERTERS_MODE,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    HVDC_LINE_TAB,
    LOSS_FACTOR,
    MAX_P,
    NOMINAL_V,
    POWER_FACTOR,
    R,
} from '../../../../../utils/field-constants';
import yup from '../../../../../utils/yup-config';
import { CustomFormProvider, ExtendedEquipmentType } from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { LccModificationForm } from './lcc-modification-form';
import {
    getLccConverterStationFromSearchCopy,
    getLccConverterStationModificationEmptyFormData, getLccConverterStationModificationSchema,
    getLccHvdcLineEmptyFormData,
    getLccHvdcLineFromSearchCopy,
    getLccHvdcLineModificationSchema,
} from '../lcc-utils';
import { LccCreationDialogTab, LccCreationInfos, LccFormInfos, ShuntCompensatorFormSchema } from '../lcc-type';
import ModificationDialog from '../../../../commons/modificationDialog';
import { useCallback, useState } from 'react';
import { LccCreationSchemaForm } from '../creation/lcc-creation-dialog';
import EquipmentSearchDialog from 'components/dialogs/equipment-search-dialog';
import { useFormSearchCopy } from '../../../../commons/use-form-search-copy';
import { Grid } from '@mui/material';
import LccCreationDialogHeader from '../creation/lcc-creation-dialog-header';
import LccTabs from '../lcc-tabs';
import { useOpenShortWaitFetching } from '../../../../commons/handle-modification-form';
import { FORM_LOADING_DELAY } from '../../../../../network/constants';
import { DialogProps } from '@mui/material/Dialog/Dialog';
import { CurrentTreeNode } from '../../../../../../redux/reducer';
import { UUID } from 'crypto';
import { FetchStatus } from 'services/utils.type';
import { Property } from '../../../common/properties/property-utils';
import { DeepNullable } from '../../../../../utils/ts-utils';

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    [HVDC_LINE_TAB]: getLccHvdcLineEmptyFormData(),
    [CONVERTER_STATION_1]: getLccConverterStationModificationEmptyFormData(),
    [CONVERTER_STATION_2]: getLccConverterStationModificationEmptyFormData(),
};

export type LccModificationSchemaForm = {
    [EQUIPMENT_ID]?: string | null;
    [EQUIPMENT_NAME]?: string | null;
    [HVDC_LINE_TAB]: {
        [NOMINAL_V]?: number | null;
        [R]?: number | null;
        [MAX_P]?: number | null;
        [CONVERTERS_MODE]?: string | null;
        [ACTIVE_POWER_SETPOINT]?: number;
        [ADDITIONAL_PROPERTIES]: Property[];
    };
    [CONVERTER_STATION_1]: {
        [CONVERTER_STATION_ID]?: string | null;
        [CONVERTER_STATION_NAME]?: string | null;
        [LOSS_FACTOR]?: number | null;
        [POWER_FACTOR]?: number | null;
        //[FILTERS_SHUNT_COMPENSATOR_TABLE]: ShuntCompensatorFormSchema[];
    };
    [CONVERTER_STATION_2]: {
        [CONVERTER_STATION_ID]?: string | null;
        [CONVERTER_STATION_NAME]?: string | null;
        [LOSS_FACTOR]?: number | null;
        [POWER_FACTOR]?: number | null;
        //[FILTERS_SHUNT_COMPENSATOR_TABLE]: ShuntCompensatorFormSchema[];
    };
};

interface LccModificationDialogProps extends Partial<DialogProps> {
    editData: LccCreationInfos;
    currentNode: CurrentTreeNode;
    studyUuid: UUID;
    currentRootNetworkUuid: UUID;
    isUpdate: boolean;
    editDataFetchStatus: FetchStatus;
}

const formSchema = yup.object().shape({
    [EQUIPMENT_ID]: yup.string().nullable(),
    [EQUIPMENT_NAME]: yup.string().nullable(),
    [HVDC_LINE_TAB]: getLccHvdcLineModificationSchema(),
    [CONVERTER_STATION_1]: getLccConverterStationModificationSchema(),
    [CONVERTER_STATION_2]: getLccConverterStationModificationSchema(),
});

export const LccModificationDialog = ({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<LccModificationDialogProps>) => {
    const [tabIndex, setTabIndex] = useState<number>(LccCreationDialogTab.HVDC_LINE_TAB);
    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);

    const formMethods = useForm<DeepNullable<LccModificationSchemaForm>>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = useForm();

    const clear = useCallback(() => reset(emptyFormData), [reset]);

    const onSubmit = useCallback((lccHvdcLine: LccCreationSchemaForm) => {}, []);

    const headerAndTabs = (
        <Grid container spacing={2}>
            <LccCreationDialogHeader />
            <LccTabs tabIndex={tabIndex} tabIndexesWithError={tabIndexesWithError} setTabIndex={setTabIndex} />
        </Grid>
    );

    const onValidationError = useCallback(
        (errors: any) => {
            const tabsInError = [];
            if (errors?.[HVDC_LINE_TAB]) {
                tabsInError.push(LccCreationDialogTab.HVDC_LINE_TAB);
            }
            if (errors?.[CONVERTER_STATION_1]) {
                tabsInError.push(LccCreationDialogTab.CONVERTER_STATION_1);
            }
            if (errors?.[CONVERTER_STATION_2]) {
                tabsInError.push(LccCreationDialogTab.CONVERTER_STATION_2);
            }

            if (tabsInError.includes(tabIndex)) {
                // error in current tab => do not change tab systematically but remove current tab in error list
                setTabIndexesWithError(tabsInError.filter((errorTabIndex) => errorTabIndex !== tabIndex));
            } else if (tabsInError.length > 0) {
                // switch to the first tab in the list then remove the tab in the error list
                setTabIndex(tabsInError[0]);
                setTabIndexesWithError(tabsInError.filter((errorTabIndex, index, arr) => errorTabIndex !== arr[0]));
            }
        },
        [tabIndex]
    );

    const fromSearchCopyToFormValues = (lccHvdcLine: LccFormInfos) => ({
        [EQUIPMENT_ID]: lccHvdcLine.id + '(1)',
        [EQUIPMENT_NAME]: lccHvdcLine.name ?? '',
        [HVDC_LINE_TAB]: getLccHvdcLineFromSearchCopy(lccHvdcLine),
        [CONVERTER_STATION_1]: getLccConverterStationFromSearchCopy(lccHvdcLine.lccConverterStation1),
        [CONVERTER_STATION_2]: getLccConverterStationFromSearchCopy(lccHvdcLine.lccConverterStation2),
    });

    const searchCopy = useFormSearchCopy((data) => {
        reset(fromSearchCopyToFormValues(data), { keepDefaultValues: true });
    }, ExtendedEquipmentType.HVDC_LINE_LCC);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClose={clear}
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-create-lcc"
                titleId="CreateLcc"
                subtitle={headerAndTabs}
                searchCopy={searchCopy}
                onValidationError={onValidationError}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                PaperProps={{
                    sx: {
                        height: '95vh',
                    },
                }}
                {...dialogProps}
            >
                <LccModificationForm
                    studyUuid={studyUuid}
                    currentNode={currentNode}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                    tabIndex={tabIndex}
                />
                <EquipmentSearchDialog
                    open={searchCopy.isDialogSearchOpen}
                    onClose={searchCopy.handleCloseSearchDialog}
                    onSelectionChange={searchCopy.handleSelectionChange}
                    equipmentType={ExtendedEquipmentType.HVDC_LINE_LCC}
                    currentNodeUuid={currentNode?.id}
                    currentRootNetworkUuid={currentRootNetworkUuid}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
};
