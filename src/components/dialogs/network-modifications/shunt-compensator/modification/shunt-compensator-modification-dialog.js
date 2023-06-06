import { useSnackMessage } from '@gridsuite/commons-ui';
import {
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
} from '../../../../utils/field-constants';
import {
    getCharacteristicsEmptyFormData,
    getCharacteristicsFormData,
    getCharacteristicsFormValidationSchema,
} from '../characteristics-pane/characteristics-form-utils';
import { FormProvider, useForm } from 'react-hook-form';
import yup from '../../../../utils/yup-config';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useEffect } from 'react';
import { FetchStatus } from '../../../../../utils/rest-api';
import ModificationDialog from '../../../commons/modificationDialog';
import ShuntCompensatorModificationForm from './shunt-compensator-modification-form';
import {useOpenShortWaitFetching} from "../../../commons/handle-modification-form";
import {FORM_LOADING_DELAY} from "../../../../network/constants";

const emptyFormData = {
    [EQUIPMENT_ID]: '',
    [EQUIPMENT_NAME]: '',
    ...getCharacteristicsEmptyFormData(),
};

const formSchema = yup
    .object()
    .shape({
        [EQUIPMENT_ID]: yup.string().required(),
        [EQUIPMENT_NAME]: yup.string(),
        ...getCharacteristicsFormValidationSchema(),
    })
    .required();

const ShuntCompensatorModificationDialog = ({
    studyUuid,
    currentNode,
    editData,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}) => {
    const currentNodeUuid = currentNode?.id;

    const { snackError } = useSnackMessage();

    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    const fromEditDataToFormValues = useCallback(
        (shuntCompensator) => {
            reset({
                [EQUIPMENT_ID]: shuntCompensator.equipmentId,
                [EQUIPMENT_NAME]: shuntCompensator.equipmentName ?? '',
                ...getCharacteristicsFormData({
                    susceptancePerSection:
                        shuntCompensator.susceptancePerSection,
                    qAtNominalV: shuntCompensator.qAtNominalV,
                    shuntCompensatorType: shuntCompensator.shuntCompensatorType,
                }),
            });
        },
        [reset]
    );

    useEffect(() => {
        if (editData) {
            fromEditDataToFormValues(editData);
        }
    }, [fromEditDataToFormValues, editData]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate ||
            editDataFetchStatus === FetchStatus.SUCCEED ||
            editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onSubmit = useCallback((shuntCompensator) => {
        console.log('Shunt compensator modif : ', shuntCompensator);
    });

    return (
        <FormProvider validationSchema={formSchema} {...formMethods}>
            <ModificationDialog
                fullWidth
                maxWidth="md"
                onClear={clear}
                onSave={onSubmit}
                aria-labelledby="dialog-modify-shuntCompensator"
                titleId="ModifyShuntCompensator"
                open={open}
                isDataFetching={
                    isUpdate && editDataFetchStatus === FetchStatus.RUNNING
                }
                {...dialogProps}
            >
                <ShuntCompensatorModificationForm />
            </ModificationDialog>
        </FormProvider>
    );
};

export default ShuntCompensatorModificationDialog;
