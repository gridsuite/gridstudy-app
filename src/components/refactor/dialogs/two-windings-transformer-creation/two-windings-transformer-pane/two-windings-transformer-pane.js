import { Grid } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { FormattedMessage } from 'react-intl';
import {
    AmpereAdornment,
    filledTextField,
    gridItem,
    MicroSusceptanceAdornment,
    MVAPowerAdornment,
    OhmAdornment,
    VoltageAdornment,
} from '../../../../dialogs/dialogUtils';
import FloatInput from '../../../inputs/float-input';
import TextInput from '../../../inputs/text-input';
import { formControlledItem } from '../../../utils/form-utils';
import { ConnectivityForm } from '../../connectivity/connectivity-form';
import {
    CURRENT_LIMITS_1,
    CURRENT_LIMITS_2,
    EQUIPMENT_ID,
    EQUIPMENT_NAME,
    MAGNETIZING_CONDUCTANCE,
    MAGNETIZING_SUSCEPTANCE,
    PERMANENT_LIMIT,
    RATED_S,
    RATED_VOLTAGE_1,
    RATED_VOLTAGE_2,
    SERIES_REACTANCE,
    SERIES_RESISTANCE,
} from '../two-windings-transformer-creation-dialog';

const useStyles = makeStyles((theme) => ({
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
}));

const TwoWindingsTransformerPane = () => {
    const classes = useStyles();

    // CHARACTERISTICS TAP PANE
    const twoWindingsTransformerIdField = formControlledItem(
        <TextInput label="ID" formProps={filledTextField} />,
        EQUIPMENT_ID
    );

    const twoWindingsTransformerNameField = formControlledItem(
        <TextInput label="Name" formProps={filledTextField} />,
        EQUIPMENT_NAME
    );

    const seriesResistanceField = formControlledItem(
        <FloatInput label="SeriesResistanceText" adornment={OhmAdornment} />,
        SERIES_RESISTANCE
    );

    const seriesReactanceField = formControlledItem(
        <FloatInput label="SeriesReactanceText" adornment={OhmAdornment} />,
        SERIES_REACTANCE
    );

    const magnetizingConductanceField = formControlledItem(
        <FloatInput
            label="MagnetizingConductance"
            adornment={MicroSusceptanceAdornment}
        />,
        MAGNETIZING_CONDUCTANCE
    );

    const magnetizingSusceptanceField = formControlledItem(
        <FloatInput
            label="MagnetizingSusceptance"
            adornment={MicroSusceptanceAdornment}
        />,
        MAGNETIZING_SUSCEPTANCE
    );

    const ratedSField = formControlledItem(
        <FloatInput
            label="RatedNominalPowerText"
            adornment={MVAPowerAdornment}
        />,
        RATED_S
    );

    const ratedVoltage1Field = formControlledItem(
        <FloatInput label="RatedVoltage" adornment={VoltageAdornment} />,
        RATED_VOLTAGE_1
    );

    const ratedVoltage2Field = formControlledItem(
        <FloatInput label="RatedVoltage" adornment={VoltageAdornment} />,
        RATED_VOLTAGE_2
    );

    const permanentCurrentLimit1Field = formControlledItem(
        <FloatInput
            label="PermanentCurrentLimitText1"
            adornment={AmpereAdornment}
        />,
        `${CURRENT_LIMITS_1}.${PERMANENT_LIMIT}`
    );

    const permanentCurrentLimit2Field = formControlledItem(
        <FloatInput
            label="PermanentCurrentLimitText2"
            adornment={AmpereAdornment}
        />,
        `${CURRENT_LIMITS_2}.${PERMANENT_LIMIT}`
    );

    const connectivity1Field = (
        <ConnectivityForm
            id="connectivity1"
            withPosition={true}
            direction="column"
        />
    );

    const connectivity2Field = (
        <ConnectivityForm
            id="connectivity2"
            withPosition={true}
            direction="column"
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                {gridItem(twoWindingsTransformerIdField)}
                {gridItem(twoWindingsTransformerNameField)}
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h3 className={classes.h3}>
                        <FormattedMessage id="Connectivity" />
                    </h3>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="OriginSide" />
                    </h4>
                </Grid>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="ExtremitySide" />
                    </h4>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item container xs={6} direction="column">
                    <Grid container direction="column" spacing={2}>
                        {gridItem(connectivity1Field, 12)}
                    </Grid>
                </Grid>
                <Grid item container direction="column" xs={6}>
                    <Grid container direction="column" spacing={2}>
                        {gridItem(connectivity2Field, 12)}
                    </Grid>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h3>
                        <FormattedMessage id="Characteristics" />
                    </h3>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {gridItem(seriesResistanceField)}
                {gridItem(seriesReactanceField)}
                {gridItem(magnetizingConductanceField)}
                {gridItem(magnetizingSusceptanceField)}
                {gridItem(ratedSField)}
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="OriginSide" />
                    </h4>
                </Grid>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="ExtremitySide" />
                    </h4>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {gridItem(ratedVoltage1Field)}
                {gridItem(ratedVoltage2Field)}
            </Grid>
            {/* <br /> */}
            <Grid container spacing={2}>
                <Grid item xs={12}>
                    <h3 className={classes.h3}>
                        <FormattedMessage id="Limits" />
                    </h3>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="OriginSide" />
                    </h4>
                </Grid>
                <Grid item xs={6}>
                    <h4 className={classes.h4}>
                        <FormattedMessage id="ExtremitySide" />
                    </h4>
                </Grid>
            </Grid>
            <Grid container spacing={2}>
                {gridItem(permanentCurrentLimit1Field)}
                {gridItem(permanentCurrentLimit2Field)}
            </Grid>
        </>
    );
};

export default TwoWindingsTransformerPane;
