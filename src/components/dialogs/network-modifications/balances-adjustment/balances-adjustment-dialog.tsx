/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { useCallback, useEffect, useMemo } from 'react';
import {
    BalancesAdjustmentDto,
    BalancesAdjustmentForm,
    balancesAdjustmentEmptyFormData,
    balancesAdjustmentDtoToForm,
    balancesAdjustmentFormSchema,
    balancesAdjustmentFormToDto,
    BalancesAdjustmentFormData,
    BalancesAdjustmentTab,
    BALANCES_ADJUSTMENT_TAB_FIELDS,
    CustomFormProvider,
    snackWithFallback,
    useSnackMessage,
    useTabs,
} from '@gridsuite/commons-ui';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FetchStatus } from '../../../../services/utils';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import { NetworkModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import { balancesAdjustment } from 'services/study/network-modifications';
import { useLocalizedCountries } from '../../../utils/localized-countries-hook';
import { getLoadFlowParametersId } from 'services/study/loadflow';

export type BalancesAdjustmentDialogProps = NetworkModificationDialogProps & {
    editData: BalancesAdjustmentDto;
};

export function BalancesAdjustmentDialog({
    editData,
    currentNode,
    studyUuid,
    currentRootNetworkUuid,
    isUpdate,
    editDataFetchStatus,
    ...dialogProps
}: Readonly<BalancesAdjustmentDialogProps>) {
    const currentNodeUuid = currentNode?.id;
    const { snackError } = useSnackMessage();
    const { countryCodes, translate } = useLocalizedCountries();

    const formSchema = useMemo(() => balancesAdjustmentFormSchema(countryCodes), [countryCodes]);

    const formMethods = useForm<BalancesAdjustmentFormData>({
        defaultValues: balancesAdjustmentEmptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset, formState } = formMethods;

    const useTabsReturn = useTabs<BalancesAdjustmentTab>({
        defaultTab: BalancesAdjustmentTab.AREAS_TAB,
        errors: formState.errors,
        tabFields: BALANCES_ADJUSTMENT_TAB_FIELDS,
    });

    useEffect(() => {
        if (editData) {
            reset(balancesAdjustmentDtoToForm(editData));
        }
    }, [editData, reset]);

    const onSubmit = useCallback(
        async (form: BalancesAdjustmentFormData) => {
            try {
                const dto = balancesAdjustmentFormToDto(form, null);
                const loadFlowParametersId = dto.withLoadFlow ? await getLoadFlowParametersId(studyUuid) : null;

                await balancesAdjustment(studyUuid, currentNodeUuid, editData?.uuid, {
                    ...dto,
                    loadFlowParametersId,
                });
            } catch (error) {
                snackWithFallback(snackError, error, {
                    headerId: 'BalancesAdjustmentError',
                });
            }
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(balancesAdjustmentEmptyFormData);
    }, [reset]);

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    return (
        <CustomFormProvider validationSchema={formSchema} removeOptional={true} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                onValidationError={useTabsReturn.onError}
                maxWidth={'md'}
                titleId="BalancesAdjustment"
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <BalancesAdjustmentForm
                    countryCodes={countryCodes}
                    translate={translate}
                    useTabsReturn={useTabsReturn}
                />
            </ModificationDialog>
        </CustomFormProvider>
    );
}
