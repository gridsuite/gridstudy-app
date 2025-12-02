/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ModificationDialog } from 'components/dialogs/commons/modificationDialog';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CustomFormProvider, snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { FieldErrors, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
    BALANCES_ADJUSTMENT,
    BALANCES_ADJUSTMENT_ADVANCED,
    BALANCES_ADJUSTMENT_BALANCE_TYPE,
    BALANCES_ADJUSTMENT_COUNTRIES,
    BALANCES_ADJUSTMENT_COUNTRIES_TO_BALANCE,
    BALANCES_ADJUSTMENT_MAX_NUMBER_ITERATIONS,
    BALANCES_ADJUSTMENT_SHIFT_EQUIPMENT_TYPE,
    BALANCES_ADJUSTMENT_SHIFT_TYPE,
    BALANCES_ADJUSTMENT_SUBTRACT_LOAD_FLOW_BALANCING,
    BALANCES_ADJUSTMENT_TARGET,
    BALANCES_ADJUSTMENT_THRESHOLD_NET_POSITION,
    BALANCES_ADJUSTMENT_WITH_LOAD_FLOW,
    BALANCES_ADJUSTMENT_WITH_RATIO_TAP_CHANGERS,
    BALANCES_ADJUSTMENT_ZONE,
    BALANCES_ADJUSTMENT_ZONES,
    SELECTED,
} from '../../../utils/field-constants';
import { useOpenShortWaitFetching } from '../../commons/handle-modification-form';
import { FetchStatus } from '../../../../services/utils';
import { FORM_LOADING_DELAY } from '../../../network/constants';
import yup from 'components/utils/yup-config';
import { NetworkModificationDialogProps } from '../../../graph/menus/network-modifications/network-modification-menu.type';
import {
    BalancesAdjustmentInfos,
    BalancesAdjustmentZoneInfos,
    BalanceType,
    ShiftEquipmentType,
    ShiftType,
} from '../../../../services/network-modification-types';
import { balancesAdjustment } from 'services/study/network-modifications';
import BalancesAdjustmentTable from './balances-adjustment-table';
import { useLocalizedCountries } from '../../../utils/localized-countries-hook';
import BalancesAdjustmentDialogTabs from './balances-adjustment-dialog-tabs';
import { BalancesAdjustmentTab } from './balances-adjustment.constants';
import { Box } from '@mui/material';
import BalancesAdjustmentAdvancedContent from './balances-adjustment-advanced-content';
import { getLoadFlowParametersId } from 'services/study/loadflow';

type BalancesAdjustmentForm = {
    [BALANCES_ADJUSTMENT]: {
        [BALANCES_ADJUSTMENT_ZONES]: {
            [SELECTED]: boolean;
            [BALANCES_ADJUSTMENT_ZONE]: string;
            [BALANCES_ADJUSTMENT_COUNTRIES]: string[];
            [BALANCES_ADJUSTMENT_SHIFT_EQUIPMENT_TYPE]: ShiftEquipmentType;
            [BALANCES_ADJUSTMENT_SHIFT_TYPE]: ShiftType;
            [BALANCES_ADJUSTMENT_TARGET]: number;
        }[];
        [BALANCES_ADJUSTMENT_ADVANCED]: {
            [BALANCES_ADJUSTMENT_WITH_LOAD_FLOW]: boolean;
            [BALANCES_ADJUSTMENT_WITH_RATIO_TAP_CHANGERS]: boolean;
            [BALANCES_ADJUSTMENT_SUBTRACT_LOAD_FLOW_BALANCING]: boolean;
            [BALANCES_ADJUSTMENT_MAX_NUMBER_ITERATIONS]: number;
            [BALANCES_ADJUSTMENT_THRESHOLD_NET_POSITION]: number;
            [BALANCES_ADJUSTMENT_COUNTRIES_TO_BALANCE]: string[];
            [BALANCES_ADJUSTMENT_BALANCE_TYPE]: BalanceType;
        };
    };
};

const emptyFormData = {
    [BALANCES_ADJUSTMENT]: {
        [BALANCES_ADJUSTMENT_ZONES]: [
            {
                [SELECTED]: false,
                [BALANCES_ADJUSTMENT_ZONE]: '',
                [BALANCES_ADJUSTMENT_COUNTRIES]: [],
                [BALANCES_ADJUSTMENT_SHIFT_EQUIPMENT_TYPE]: ShiftEquipmentType.GENERATOR,
                [BALANCES_ADJUSTMENT_SHIFT_TYPE]: ShiftType.PROPORTIONAL,
                [BALANCES_ADJUSTMENT_TARGET]: 0,
            },
        ],
        [BALANCES_ADJUSTMENT_ADVANCED]: {
            [BALANCES_ADJUSTMENT_WITH_LOAD_FLOW]: true,
            [BALANCES_ADJUSTMENT_WITH_RATIO_TAP_CHANGERS]: false,
            [BALANCES_ADJUSTMENT_SUBTRACT_LOAD_FLOW_BALANCING]: false,
            [BALANCES_ADJUSTMENT_MAX_NUMBER_ITERATIONS]: 5,
            [BALANCES_ADJUSTMENT_THRESHOLD_NET_POSITION]: 1,
            [BALANCES_ADJUSTMENT_COUNTRIES_TO_BALANCE]: ['FR'],
            [BALANCES_ADJUSTMENT_BALANCE_TYPE]: BalanceType.PROPORTIONAL_TO_LOAD,
        },
    },
} satisfies BalancesAdjustmentForm;

export type BalancesAdjustmentDialogProps = NetworkModificationDialogProps & {
    editData: BalancesAdjustmentInfos;
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
    const { countryCodes } = useLocalizedCountries();

    const [tabIndexesWithError, setTabIndexesWithError] = useState<number[]>([]);
    const [tabIndex, setTabIndex] = useState<number>(BalancesAdjustmentTab.AREAS_TAB);

    const formSchema = useMemo(
        () =>
            yup.object().shape({
                [BALANCES_ADJUSTMENT]: yup.object().shape({
                    [BALANCES_ADJUSTMENT_ZONES]: yup
                        .array()
                        .of(
                            yup.object().shape({
                                [SELECTED]: yup.boolean().required(),
                                [BALANCES_ADJUSTMENT_ZONE]: yup.string().required(),
                                [BALANCES_ADJUSTMENT_COUNTRIES]: yup
                                    .array()
                                    .of(yup.string().oneOf(countryCodes).required())
                                    .min(1, 'balancesAdjustment.emptyCountries')
                                    .required(),
                                [BALANCES_ADJUSTMENT_SHIFT_EQUIPMENT_TYPE]: yup
                                    .string()
                                    .oneOf(Object.values(ShiftEquipmentType))
                                    .required(),
                                [BALANCES_ADJUSTMENT_SHIFT_TYPE]: yup
                                    .string()
                                    .oneOf(Object.values(ShiftType))
                                    .required(),
                                [BALANCES_ADJUSTMENT_TARGET]: yup.number().integer().required(),
                            })
                        )
                        .required(),
                    [BALANCES_ADJUSTMENT_ADVANCED]: yup.object().shape({
                        [BALANCES_ADJUSTMENT_WITH_LOAD_FLOW]: yup.boolean().required(),
                        [BALANCES_ADJUSTMENT_WITH_RATIO_TAP_CHANGERS]: yup.boolean().required(),
                        [BALANCES_ADJUSTMENT_SUBTRACT_LOAD_FLOW_BALANCING]: yup.boolean().required(),
                        [BALANCES_ADJUSTMENT_MAX_NUMBER_ITERATIONS]: yup.number().integer().positive().required(),
                        [BALANCES_ADJUSTMENT_THRESHOLD_NET_POSITION]: yup.number().positive().required(),
                        [BALANCES_ADJUSTMENT_COUNTRIES_TO_BALANCE]: yup
                            .array()
                            .of(yup.string().oneOf(countryCodes).required())
                            .when(BALANCES_ADJUSTMENT_WITH_LOAD_FLOW, {
                                is: (withLoadFlow: boolean) => withLoadFlow,
                                then: (schema) => schema.min(1, 'balancesAdjustment.emptyCountries'),
                                otherwise: (schema) => schema.optional(),
                            })
                            .required(),
                        [BALANCES_ADJUSTMENT_BALANCE_TYPE]: yup.string().oneOf(Object.values(BalanceType)).required(),
                    }),
                }),
            }),
        [countryCodes]
    );

    const formMethods = useForm<BalancesAdjustmentForm>({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });

    const { reset } = formMethods;

    useEffect(() => {
        if (editData) {
            reset({
                [BALANCES_ADJUSTMENT]: {
                    [BALANCES_ADJUSTMENT_ZONES]: editData.areas.map((area) => {
                        return {
                            [SELECTED]: false,
                            [BALANCES_ADJUSTMENT_ZONE]: area.name,
                            [BALANCES_ADJUSTMENT_COUNTRIES]: area.countries,
                            [BALANCES_ADJUSTMENT_SHIFT_EQUIPMENT_TYPE]: area.shiftEquipmentType,
                            [BALANCES_ADJUSTMENT_SHIFT_TYPE]: area.shiftType,
                            [BALANCES_ADJUSTMENT_TARGET]: area.netPosition,
                        };
                    }),
                    [BALANCES_ADJUSTMENT_ADVANCED]: {
                        [BALANCES_ADJUSTMENT_WITH_LOAD_FLOW]: editData.withLoadFlow,
                        [BALANCES_ADJUSTMENT_WITH_RATIO_TAP_CHANGERS]: editData.withRatioTapChangers,
                        [BALANCES_ADJUSTMENT_SUBTRACT_LOAD_FLOW_BALANCING]: editData.subtractLoadFlowBalancing,
                        [BALANCES_ADJUSTMENT_MAX_NUMBER_ITERATIONS]: editData.maxNumberIterations,
                        [BALANCES_ADJUSTMENT_THRESHOLD_NET_POSITION]: editData.thresholdNetPosition,
                        [BALANCES_ADJUSTMENT_COUNTRIES_TO_BALANCE]: editData.countriesToBalance,
                        [BALANCES_ADJUSTMENT_BALANCE_TYPE]: editData.balanceType,
                    },
                },
            });
        }
    }, [editData, reset]);

    const onSubmit = useCallback(
        async (form: BalancesAdjustmentForm) => {
            try {
                const withLoadFlow =
                    form[BALANCES_ADJUSTMENT][BALANCES_ADJUSTMENT_ADVANCED][BALANCES_ADJUSTMENT_WITH_LOAD_FLOW];

                // Get loadflow parameters ID only if withLoadFlow is true
                let loadFlowParametersId: string | null = null;
                if (withLoadFlow) {
                    loadFlowParametersId = await getLoadFlowParametersId(studyUuid);
                }

                await balancesAdjustment({
                    studyUuid: studyUuid,
                    nodeUuid: currentNodeUuid,
                    modificationUuid: editData?.uuid ?? undefined,
                    maxNumberIterations:
                        form[BALANCES_ADJUSTMENT][BALANCES_ADJUSTMENT_ADVANCED][
                            BALANCES_ADJUSTMENT_MAX_NUMBER_ITERATIONS
                        ],
                    thresholdNetPosition:
                        form[BALANCES_ADJUSTMENT][BALANCES_ADJUSTMENT_ADVANCED][
                            BALANCES_ADJUSTMENT_THRESHOLD_NET_POSITION
                        ],
                    countriesToBalance:
                        form[BALANCES_ADJUSTMENT][BALANCES_ADJUSTMENT_ADVANCED][
                            BALANCES_ADJUSTMENT_COUNTRIES_TO_BALANCE
                        ],
                    balanceType:
                        form[BALANCES_ADJUSTMENT][BALANCES_ADJUSTMENT_ADVANCED][BALANCES_ADJUSTMENT_BALANCE_TYPE],
                    withLoadFlow: withLoadFlow,
                    withRatioTapChangers:
                        form[BALANCES_ADJUSTMENT][BALANCES_ADJUSTMENT_ADVANCED][
                            BALANCES_ADJUSTMENT_WITH_RATIO_TAP_CHANGERS
                        ],
                    loadFlowParametersId: loadFlowParametersId,
                    subtractLoadFlowBalancing:
                        form[BALANCES_ADJUSTMENT][BALANCES_ADJUSTMENT_ADVANCED][
                            BALANCES_ADJUSTMENT_SUBTRACT_LOAD_FLOW_BALANCING
                        ],
                    areas: form[BALANCES_ADJUSTMENT][BALANCES_ADJUSTMENT_ZONES].map((balanceAdjustment) => {
                        return {
                            name: balanceAdjustment[BALANCES_ADJUSTMENT_ZONE],
                            countries: balanceAdjustment[BALANCES_ADJUSTMENT_COUNTRIES],
                            shiftEquipmentType: balanceAdjustment[BALANCES_ADJUSTMENT_SHIFT_EQUIPMENT_TYPE],
                            shiftType: balanceAdjustment[BALANCES_ADJUSTMENT_SHIFT_TYPE],
                            netPosition: balanceAdjustment[BALANCES_ADJUSTMENT_TARGET],
                        } satisfies BalancesAdjustmentZoneInfos;
                    }),
                });
            } catch (error) {
                snackWithFallback(snackError, error, {
                    headerId: 'GenerationDispatchError',
                });
            }
        },
        [editData, studyUuid, currentNodeUuid, snackError]
    );

    const clear = useCallback(() => {
        reset(emptyFormData);
    }, [reset]);

    const onValidationError = (errors: FieldErrors<BalancesAdjustmentForm>) => {
        console.log(`errors ${JSON.stringify(errors)}`);
        let tabsInError: number[] = [];
        if (errors?.[BALANCES_ADJUSTMENT]?.[BALANCES_ADJUSTMENT_ZONES] !== undefined) {
            tabsInError.push(BalancesAdjustmentTab.AREAS_TAB);
        }
        if (errors?.[BALANCES_ADJUSTMENT]?.[BALANCES_ADJUSTMENT_ADVANCED] !== undefined) {
            tabsInError.push(BalancesAdjustmentTab.ADVANCED_TAB);
        }
        if (tabsInError.length > 0) {
            setTabIndex(tabsInError[0]);
        }
        setTabIndexesWithError(tabsInError);
    };

    const open = useOpenShortWaitFetching({
        isDataFetched:
            !isUpdate || editDataFetchStatus === FetchStatus.SUCCEED || editDataFetchStatus === FetchStatus.FAILED,
        delay: FORM_LOADING_DELAY,
    });

    const tabs = useMemo(
        () => (
            <BalancesAdjustmentDialogTabs
                tabIndex={tabIndex}
                tabIndexesWithError={tabIndexesWithError}
                setTabIndex={setTabIndex}
            />
        ),
        [tabIndex, tabIndexesWithError]
    );

    return (
        <CustomFormProvider validationSchema={formSchema} removeOptional={true} {...formMethods}>
            <ModificationDialog
                fullWidth
                onClear={clear}
                onSave={onSubmit}
                onValidationError={onValidationError}
                maxWidth={'md'}
                titleId="BalancesAdjustment"
                subtitle={tabs}
                open={open}
                isDataFetching={isUpdate && editDataFetchStatus === FetchStatus.RUNNING}
                {...dialogProps}
            >
                <Box hidden={tabIndex !== BalancesAdjustmentTab.AREAS_TAB} p={1}>
                    <BalancesAdjustmentTable />
                </Box>
                <Box hidden={tabIndex !== BalancesAdjustmentTab.ADVANCED_TAB} p={1}>
                    <BalancesAdjustmentAdvancedContent />
                </Box>
            </ModificationDialog>
        </CustomFormProvider>
    );
}
