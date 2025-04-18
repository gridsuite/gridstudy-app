/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent } from 'react';
import { Grid, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';
import {
    PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
    PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD,
} from '../../../../utils/config-params';
import { FloatInput } from '@gridsuite/commons-ui';
import { styles } from '../parameters-style';

interface FieldToShow {
    label: string;
    firstField: { name: string; label: string };
    secondField?: { name: string; label: string };
    tooltipInfoId: string;
    isSingleField?: boolean;
}

const SecurityAnalysisFields: FunctionComponent<FieldToShow> = ({
    label,
    firstField,
    secondField,
    tooltipInfoId,
    isSingleField,
}) => {
    const intl = useIntl();
    return (
        <Grid sx={isSingleField ? styles.singleItem : styles.multipleItems}>
            <Grid item xs={4} sx={styles.parameterName}>
                <Typography>{intl.formatMessage({ id: label })}</Typography>
            </Grid>
            <Grid
                item
                container
                xs={isSingleField ? 8 : 4}
                sx={isSingleField ? styles.singleTextField : styles.firstTextField}
            >
                <FloatInput
                    name={firstField.name}
                    adornment={{
                        position: 'end',
                        text: firstField.label,
                    }}
                />
            </Grid>
            {!isSingleField && secondField && (
                <Grid item container xs={4} sx={styles.secondTextField}>
                    <FloatInput
                        name={secondField.name}
                        adornment={{
                            position: 'end',
                            text: secondField.label,
                        }}
                    />
                </Grid>
            )}
            <Tooltip title={<FormattedMessage id={tooltipInfoId} />} placement="left-start">
                <InfoIcon />
            </Tooltip>
        </Grid>
    );
};

// create fields with the proper data
const fieldsToShow: FieldToShow[] = [
    {
        label: 'securityAnalysis.current',
        firstField: {
            name: PARAM_SA_FLOW_PROPORTIONAL_THRESHOLD,
            label: '%',
        },
        tooltipInfoId: 'securityAnalysis.toolTip.current',
        isSingleField: true,
    },
    {
        label: 'securityAnalysis.lowVoltage',
        firstField: {
            name: PARAM_SA_LOW_VOLTAGE_PROPORTIONAL_THRESHOLD,
            label: '%',
        },
        secondField: {
            label: 'kV',
            name: PARAM_SA_LOW_VOLTAGE_ABSOLUTE_THRESHOLD,
        },
        tooltipInfoId: 'securityAnalysis.toolTip.lowVoltage',
    },
    {
        label: 'securityAnalysis.highVoltage',
        firstField: {
            name: PARAM_SA_HIGH_VOLTAGE_PROPORTIONAL_THRESHOLD,
            label: '%',
        },
        secondField: {
            label: 'kV',
            name: PARAM_SA_HIGH_VOLTAGE_ABSOLUTE_THRESHOLD,
        },
        tooltipInfoId: 'securityAnalysis.toolTip.highVoltage',
    },
];

const ViolationsHidingParameters: FunctionComponent = () => {
    const intl = useIntl();

    return (
        <>
            <Grid container spacing={1} paddingBottom={1}>
                <Grid item xs={8} sx={styles.text}>
                    <Typography>
                        {intl.formatMessage({
                            id: 'securityAnalysis.violationsHiding',
                        })}
                    </Typography>
                    <Tooltip
                        sx={styles.tooltip}
                        title={<FormattedMessage id={'securityAnalysis.toolTip.violationsHiding'} />}
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
        </>
    );
};

export default ViolationsHidingParameters;
