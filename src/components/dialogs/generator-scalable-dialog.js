import {
    useDirectoryElements,
    useDoubleValue,
    useEnumValue,
    useInputForm,
    useOptionalEnumValue,
    useRadioValue
} from "./inputs/input-hooks";
import {useEffect, useState} from "react";
import {elementType, useSnackMessage} from "@gridsuite/commons-ui";
import {useParams} from "react-router-dom";
import ModificationDialog from "./modificationDialog";
import {useBooleanValue} from "./inputs/boolean";
import Grid from "@mui/material/Grid";
import {ActivePowerAdornment, gridItem, GridSection} from "./dialogUtils";
import {EquipmentType} from "./sensi/sensi-parameters-selector";
import {VARIATION_MODE} from "../network/constants";
import {useExpandableValues} from "./inputs/use-expandable-values";
const GeneratorScalableVariation = ({
   index,
   onChange,
   defaultValue,
   inputForm,
   isDeltaP
}) => {
    const [filter, filterField] = useDirectoryElements({
        label: 'filter',
        initialValues: defaultValue.filter ?? [],
        validation: {
            isFieldRequired: true,
        },
        elementType: elementType.FILTER,
        equipmentTypes: EquipmentType.GENERATOR,
    });

    const [pValue, pField] = useDoubleValue({
        label: isDeltaP ? 'DeltaP' : 'TargetP',
        validation: {
            isFieldRequired: true,
        },
        inputForm: inputForm,
        defaultValue: defaultValue.pValue ?? '',
    })

    const [variationMode, variationModeField] = useOptionalEnumValue({
        label: 'VariationMode',
        defaultValue: defaultValue.variationMode ?? VARIATION_MODE.PROPORTIONAL_TO_P_MAX.label,
        enumObjects: VARIATION_MODE
    })

    useEffect(() => {
        onChange(filter, pValue, variationMode);
    }, [filter, pValue, variationMode]);

    return (
        <>
            {gridItem(filterField, 4)}
            {gridItem(pField, 4)}
            {gridItem(variationModeField, 4)}
        </>
    );
}

const GeneratorScalableDialog = ({
    editData,
    ...dialogProps
}) => {
    //const studyUuid = decodeURIComponent(useParams().studyUuid);

    //const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    useEffect(() => {
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    function validateVariation(values) {
        const res = new Map();
        const idMap = values.reduce(
            (m, v) => m.set(v.id, m.get(v.id) || 0),
            new Map()
        );

        values.forEach((val, idx) => {
            const errorId = idMap.get(val.id);
            if (errorId)
                res.set(idx, {
                    error: true,
                    ...errorId,
                });
        });
        return res;
    }

    const [generatorScalableRadioChoice, generatorScalableRadioField] = useRadioValue({
        defaultValue: formValues?.deltaP ?? 'deltaP',
        possibleValues: [
            {id: "deltaP", label:'DeltaP'},
            {id: "targetP", label: 'TargetP'},
        ]
    })

    const [iterativeValue, iterativeField] = useBooleanValue({
        label: 'IterativeLabel',
        defaultValue: formValues?.iterative ?? true,
        inputForm: inputForm
    });

    const [variations, variationsField] = useExpandableValues({
        id: 'variations',
        labelAddValue: 'CreateVariation',
        validateItem: validateVariation,
        inputForm: inputForm,
        defaultValues: formValues?.variation,
        Field: GeneratorScalableVariation,
        isRequired: true,
    });

    const handleClear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
        console.log('Result :  ', variations, iterativeValue, generatorScalableRadioChoice);
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
                {gridItem(generatorScalableRadioField, 12)}
            </Grid>

            <Grid container>
                {gridItem(iterativeField, 12)}
            </Grid>

            <GridSection title="Variations" />
            <Grid container>
                {gridItem(variationsField, 12)}
            </Grid>

        </ModificationDialog>
    )
};

export default GeneratorScalableDialog;