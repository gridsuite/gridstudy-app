/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React, {
    ChangeEvent,
    FunctionComponent,
    useCallback,
    useState,
} from 'react';
import { Grid } from '@mui/material';
import { DropDown, LabelledButton, styles } from '../parameters.jsx';
import { LineSeparator } from '../../dialogUtils.jsx';
import { useIntl } from 'react-intl';
import { mergeSx } from '../../../utils/functions.js';
import {
    DirectoryItemSelector,
    ElementType,
    useSnackMessage,
} from '@gridsuite/commons-ui';
import { fetchSecurityAnalysisParameters } from '../../../../services/security-analysis.js';
import SecurityAnalysisParametersSelector from './security-analysis-parameters-selector';
import CreateParameterDialog from '../common/parameters-creation-dialog';

export const SecurityAnalysisParameters: FunctionComponent<
    Record<string, any>
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

    const handleUpdateProvider = (
        evt: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => updateProvider(evt.target.value);

    const updateProviderCallback = useCallback(handleUpdateProvider, [
        updateProvider,
    ]);
    const intl = useIntl();
    const [openCreateParameterDialog, setOpenCreateParameterDialog] =
        useState(false);
    const [openSelectParameterDialog, setOpenSelectParameterDialog] =
        useState(false);
    const { snackError } = useSnackMessage();

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

    const handleLoadParameter = useCallback(
        (newParams: Record<string, any>) => {
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
                            values={securityAnalysisProvider}
                            callback={updateProviderCallback}
                        />
                    </Grid>
                    <Grid container paddingTop={1} paddingBottom={1}>
                        <LineSeparator />
                    </Grid>
                    <SecurityAnalysisParametersSelector
                        params={params}
                        updateParameters={updateParameters}
                    />
                </Grid>
                <Grid
                    container
                    key="secuAnalysisProvider"
                    sx={styles.scrollableGrid}
                    spacing={1}
                ></Grid>
                <LineSeparator />
            </Grid>
            <Grid
                container
                sx={mergeSx(
                    styles.controlParametersItem,
                    styles.marginTopButton
                )}
            >
                <LabelledButton
                    callback={() => setOpenSelectParameterDialog(true)}
                    label="settings.button.chooseSettings"
                />
                <LabelledButton
                    callback={() => setOpenCreateParameterDialog(true)}
                    label="save"
                />
                <LabelledButton
                    callback={resetSAParametersAndProvider}
                    label="resetToDefault"
                />
                <LabelledButton
                    label="resetProviderValuesToDefault"
                    callback={resetSAParameters}
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
