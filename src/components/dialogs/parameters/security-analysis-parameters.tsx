/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, useCallback, useState } from 'react';
import { Grid, SelectChangeEvent, Tooltip } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { parameterStyles } from './parameters-style';
import { LineSeparator } from '../dialogUtils';
import Typography from '@mui/material/Typography';
import {
    PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD,
} from '../../../utils/config-params';
import { FormattedMessage, useIntl } from 'react-intl';
import { mergeSx } from '../../utils/functions';
import CreateParameterDialog from './common/parameters-creation-dialog';
import {
    DirectoryItemSelector,
    TreeViewFinderNodeProps,
} from '@gridsuite/commons-ui';
import { fetchSecurityAnalysisParameters } from '../../../services/security-analysis';
import { ElementType, useSnackMessage } from '@gridsuite/commons-ui';
import { DropDown } from './common/drop-down';
import { LabelledButton } from './common/labelled-button';
import { UseParametersBackendReturnProps } from './common/use-parameters-backend';
import {
    SecurityAnalysisFields,
    formatValues,
} from './security-analysis/security-analysis-fields';

interface SecurityAnalysisParametersProps {
    parametersBackend: UseParametersBackendReturnProps;
}

export const SecurityAnalysisParameters: FunctionComponent<
    SecurityAnalysisParametersProps
> = ({ parametersBackend }) => {
    const [
        providers,
        provider,
        updateProvider,
        resetProvider,
        params,
        updateParameters,
        resetParameters,
    ] = parametersBackend;

    const handleUpdateProvider = (evt: SelectChangeEvent<string>) =>
        updateProvider(evt.target.value);

    const updateProviderCallback = useCallback(handleUpdateProvider, [
        updateProvider,
    ]);
    const intl = useIntl();
    const [openCreateParameterDialog, setOpenCreateParameterDialog] =
        useState(false);
    const [openSelectParameterDialog, setOpenSelectParameterDialog] =
        useState(false);
    const { snackError } = useSnackMessage();

    const callBack = (data: Record<string, any>) => {
        updateParameters({ ...data });
    };

    // TODO: remove this when DynaFlow is supported
    // DynaFlow is not supported at the moment for security analysis
    const securityAnalysisProvider = Object.fromEntries(
        Object.entries(providers).filter(([key]) => !key.includes('DynaFlow'))
    );

    const resetSAParametersAndProvider = useCallback(() => {
        resetParameters();
        resetProvider();
    }, [resetParameters, resetProvider]);

    const resetSAParameters = useCallback(() => {
        resetParameters();
    }, [resetParameters]);

    // create fields with the proper data
    const fieldsToShow = [
        {
            label: intl.formatMessage({
                id: 'securityAnalysis.current',
            }),
            firstField: {
                name: PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD,
                label: '%',
            },
            tooltipInfoId: 'securityAnalysis.toolTip.current',
            initValue: formatValues(params, false),
            callback: callBack,
            isSingleField: true,
        },
        {
            label: intl.formatMessage({
                id: 'securityAnalysis.lowVoltage',
            }),
            firstField: {
                name: PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD,
                label: '%',
            },
            secondField: {
                label: 'kV',
                name: PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
            },
            tooltipInfoId: 'securityAnalysis.toolTip.lowVoltage',
            initValue: formatValues(params, false),
            callback: callBack,
        },
        {
            label: intl.formatMessage({
                id: 'securityAnalysis.highVoltage',
            }),
            firstField: {
                name: PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD,
                label: '%',
            },
            secondField: {
                label: 'kV',
                name: PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
            },
            tooltipInfoId: 'securityAnalysis.toolTip.highVoltage',
            initValue: formatValues(params, false),
            callback: callBack,
        },
    ];
    const handleLoadParameter = useCallback(
        (newParams: TreeViewFinderNodeProps[]) => {
            if (newParams && newParams.length > 0) {
                setOpenSelectParameterDialog(false);
                fetchSecurityAnalysisParameters(newParams[0].id)
                    .then((parameters) => {
                        console.info(
                            'loading the following security analysis parameters : ' +
                                parameters.uuid
                        );
                        updateParameters({ ...parameters });
                    })
                    .catch((error) => {
                        console.error(error);
                        snackError({
                            messageTxt: error.message,
                            headerId: 'paramsRetrievingError',
                        });
                    });
            }
            setOpenSelectParameterDialog(false);
        },
        [snackError, updateParameters]
    );

    return (
        <>
            <Grid sx={{ height: '100%' }}>
                <Grid container spacing={1} padding={1}>
                    <Grid
                        container
                        spacing={1}
                        sx={{
                            padding: 0,
                            paddingBottom: 2,
                            justifyContent: 'space-between',
                        }}
                        xl={6}
                    >
                        <DropDown
                            value={provider}
                            label="Provider"
                            options={securityAnalysisProvider}
                            onChange={updateProviderCallback}
                        />
                    </Grid>
                    <Grid container spacing={1} paddingBottom={1}>
                        <Grid item xs={8} sx={parameterStyles.text}>
                            <Typography>
                                {intl.formatMessage({
                                    id: 'securityAnalysis.violationsHiding',
                                })}
                            </Typography>
                            <Tooltip
                                sx={parameterStyles.tooltip}
                                title={
                                    <FormattedMessage
                                        id={
                                            'securityAnalysis.toolTip.violationsHiding'
                                        }
                                    />
                                }
                                placement="left-start"
                            >
                                <InfoIcon />
                            </Tooltip>
                        </Grid>
                    </Grid>

                    {fieldsToShow?.map((item) => {
                        return (
                            <Grid item xs={16} xl={6.25} key={item.label}>
                                <SecurityAnalysisFields {...item} />
                            </Grid>
                        );
                    })}
                </Grid>
                <Grid
                    container
                    key="secuAnalysisProvider"
                    sx={parameterStyles.scrollableGrid}
                    spacing={1}
                ></Grid>
                <LineSeparator />
            </Grid>
            <Grid
                container
                sx={mergeSx(
                    parameterStyles.controlParametersItem,
                    parameterStyles.marginTopButton
                )}
            >
                <LabelledButton
                    onClick={() => setOpenSelectParameterDialog(true)}
                    label="settings.button.chooseSettings"
                />
                <LabelledButton
                    onClick={() => setOpenCreateParameterDialog(true)}
                    label="save"
                />
                <LabelledButton
                    onClick={resetSAParametersAndProvider}
                    label="resetToDefault"
                />
                <LabelledButton
                    label="resetProviderValuesToDefault"
                    onClick={resetSAParameters}
                />
            </Grid>
            {openCreateParameterDialog && (
                <CreateParameterDialog
                    open={openCreateParameterDialog}
                    onClose={() => setOpenCreateParameterDialog(false)}
                    parameterValues={() => {
                        return { ...params };
                    }}
                    parameterFormatter={(newParams) => newParams}
                    parameterType={ElementType.SECURITY_ANALYSIS_PARAMETERS}
                />
            )}

            {openSelectParameterDialog && (
                <DirectoryItemSelector
                    open={openSelectParameterDialog}
                    onClose={handleLoadParameter}
                    types={[ElementType.SECURITY_ANALYSIS_PARAMETERS]}
                    title={intl.formatMessage({
                        id: 'showSelectParameterDialog',
                    })}
                    onlyLeaves={true}
                    multiselect={false}
                    validationButtonText={intl.formatMessage({
                        id: 'validate',
                    })}
                />
            )}
        </>
    );
};
