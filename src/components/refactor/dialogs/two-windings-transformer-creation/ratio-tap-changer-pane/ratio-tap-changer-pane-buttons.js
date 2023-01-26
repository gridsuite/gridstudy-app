import { Button, Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import { useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import {
    HIGH_TAP_POSITION,
    LOW_TAP_POSITION,
} from '../two-windings-transformer-creation-dialog-utils';
import { RATIO_TAP_CHANGER } from './ratio-tap-changer-pane-utils';

const useStyles = makeStyles((theme) => ({
    center: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
}));

const RatioTapChangerPaneButtons = ({
    generateTapRows,
    setOpenCreateRuleDialog,
    setOpenImportRuleDialog,
    isCreateRuleButtonDisabled,
    disabled,
}) => {
    const classes = useStyles();

    const lowTapPositionWatcher = useWatch({
        name: `${RATIO_TAP_CHANGER}.${LOW_TAP_POSITION}`,
    });

    const highTapPositionWatcher = useWatch({
        name: `${RATIO_TAP_CHANGER}.${HIGH_TAP_POSITION}`,
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
                    <FormattedMessage id="CreateRegulationRule" />
                </Button>
            </Grid>
            <Grid item className={classes.center}>
                <Button
                    variant="contained"
                    onClick={() => setOpenImportRuleDialog(true)}
                    disabled={disabled /*!ratioTapChangerEnabled*/}
                >
                    <FormattedMessage id="ImportRegulationRule" />
                </Button>
            </Grid>
        </Grid>
    );
};

export default RatioTapChangerPaneButtons;
