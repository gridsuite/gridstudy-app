import { Grid } from '@mui/material';
import { gridItem } from '../dialogUtils';
import makeStyles from '@mui/styles/makeStyles';
import { FormattedMessage } from 'react-intl';

const useStyles = makeStyles((theme) => ({
    h3: {
        marginBottom: 0,
        paddingBottom: 1,
    },
}));

const TwoWindingsTransformerPane = (props) => {
    const {
        twoWindingsTransformerIdField,
        twoWindingsTransformerNameField,
        seriesResistanceField,
        seriesReactanceField,
        magnetizingConductanceField,
        ratedSField,
        magnetizingSusceptanceField,
        ratedVoltage1Field,
        ratedVoltage2Field,
        permanentCurrentLimit1Field,
        permanentCurrentLimit2Field,
        connectivity1Field,
        connectivity2Field,
    } = props;

    const classes = useStyles();

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
                        <FormattedMessage id="ExtrimitySide" />
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
                        <FormattedMessage id="ExtrimitySide" />
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
                        <FormattedMessage id="ExtrimitySide" />
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
