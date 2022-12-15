import {useEnumValue, useInputForm, useRadioValue} from "./inputs/input-hooks";
import {useState} from "react";
import {useSnackMessage} from "@gridsuite/commons-ui";
import {useParams} from "react-router-dom";
import ModificationDialog from "./modificationDialog";
import {useBooleanValue} from "./inputs/boolean";
import Grid from "@mui/material/Grid";
import {gridItem, GridSection} from "./dialogUtils";

const GeneratorScalableDialog = ({
...dialogProps
}) => {
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    const [scalableRadioChoice, scalableRadioField] = useRadioValue({
        label: 'labelplaceholder',
        defaultValue: 'deltaP',
        possibleValues: [
            {id: "deltaP", label:'A P'},
            {id: "targetP", label: 'Target P'},
        ]
    })

    const [iterativeValue, iterativeField] = useBooleanValue({
        label: 'IterativeLabel',
        defaultValue: true,
        inputForm: inputForm
    });

    const handleClear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
        console.log('handle save');
    };

    return (
        <ModificationDialog
            titleId="GeneratorScalable"
            fullWidth
            disabledSave={!inputForm.hasChanged}
            onClear={handleClear}
            onValidation={handleValidation}
            onSave={handleSave}
            {...dialogProps}
        >
            <Grid container>
                {gridItem(scalableRadioField, 12)}
                {gridItem(iterativeField, 12)}
            </Grid>
            <GridSection title="Variations" />

        </ModificationDialog>
    )
};

export default GeneratorScalableDialog;