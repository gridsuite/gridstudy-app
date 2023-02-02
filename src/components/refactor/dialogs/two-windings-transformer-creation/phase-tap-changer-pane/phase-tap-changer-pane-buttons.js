/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Button, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
    PHASE_TAP_CHANGER,
} from 'components/refactor/utils/field-constants';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles((theme) => ({
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

const PhaseTapChangerPaneButtons = ({
    generateTapRows,
    setOpenCreateRuleDialog,
    setOpenImportRuleDialog,
    isCreateRuleButtonDisabled,
    disabled,
}) => {
    const classes = useStyles();

    const lowTapPositionWatcher = useWatch({
        name: `${PHASE_TAP_CHANGER}.${LOW_TAP_POSITION}`,
    });

    const highTapPositionWatcher = useWatch({
        name: `${PHASE_TAP_CHANGER}.${HIGH_TAP_POSITION}`,
    });
    return (
        <Grid container item spacing={2} xs direction={'column'}>
            <Grid item className={classes.center}>
                <Button
                    variant="contained"
                    onClick={() => generateTapRows()}
                    disabled={
                        disabled ||
                        lowTapPositionWatcher === null ||
                        highTapPositionWatcher === null
                    }
                >
                    <FormattedMessage id="GenerateTapRows" />
                </Button>
            </Grid>
            <Grid item className={classes.center}>
                <Button
                    variant="contained"
                    onClick={() => setOpenCreateRuleDialog(true)}
                    disabled={disabled || isCreateRuleButtonDisabled}
                >
                    <FormattedMessage id="CreateDephasingRule" />
                </Button>
            </Grid>
            <Grid item className={classes.center}>
                <Button
                    variant="contained"
                    onClick={() => setOpenImportRuleDialog(true)}
                    disabled={disabled}
                >
                    <FormattedMessage id="ImportDephasingRule" />
                </Button>
            </Grid>
        </Grid>
    );
};

export default PhaseTapChangerPaneButtons;
