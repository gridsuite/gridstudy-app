import RadioInput from "../../rhf-inputs/radio-input";
import {VARIATION_TYPES} from "../../../network/constants";
import {VARIATION, VARIATION_TYPE} from "../../utils/field-constants";
import VariationForm from "./variation/variation-form";
import ExpandableValuesInput from "../../rhf-inputs/expandable-values-input";
import Grid from "@mui/material/Grid";
import {gridItem, GridSection } from "../../../dialogs/dialogUtils";
import makeStyles from "@mui/styles/makeStyles";

export const useStyles = makeStyles((theme) => ({
    padding: {
        padding: '15px',
    },
}));

const GeneratorScalingForm = ({

}) => {
    const classes = useStyles
    const variationTypeField = (
        <RadioInput
            name={VARIATION_TYPE}
            options={VARIATION_TYPES}
        />
    )

    const variationsField = (
        <ExpandableValuesInput
            name={VARIATION}
            Field={VariationForm}
            labelAddValue={'CreateVariation'}
        />
    )

    return (
        <>
            <Grid className={classes.padding}>
                {gridItem(variationTypeField, 8)}
            </Grid>

            <GridSection title="Variations" />
            <Grid container className={classes.padding}>
                {gridItem(variationsField, 12)}
            </Grid>
        </>
    )
}

export default GeneratorScalingForm;