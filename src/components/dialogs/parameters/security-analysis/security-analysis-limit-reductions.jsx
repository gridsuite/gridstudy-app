/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import React from 'react';
import { Grid, Tooltip } from '@mui/material';
import { FormattedMessage, useIntl } from 'react-intl';
import { styles } from '../parameters.jsx';
import Typography from '@mui/material/Typography';
import InfoIcon from '@mui/icons-material/Info';

const LimitReductionsParameters = ({ params, updateParameters }) => {
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
                        title={
                            <FormattedMessage
                                id={'securityAnalysis.toolTip.violationsHiding'}
                            />
                        }
                        placement="left-start"
                    >
                        <InfoIcon />
                    </Tooltip>
                </Grid>
            </Grid>
        </>
    );
};

export default LimitReductionsParameters;
