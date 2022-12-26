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
import {VARIATION_MODE, VARIATION_TYPE} from "../network/constants";
import {useExpandableValues} from "./inputs/use-expandable-values";
import makeStyles from "@mui/styles/makeStyles";
import {generatorScaling} from "../../utils/rest-api";

export const useStyles = makeStyles((theme) => ({
    checkedButton: {
        marginTop: 20,
    },
    deleteButton: {
        marginTop: 10,
    },
    button: {
        justifyContent: 'flex-start',
        fontSize: 'small',
        marginTop: theme.spacing(1),
    },
    emptyListError: {
        color: theme.palette.error.main,
        fontSize: 'small',
        textAlign: 'center',
        margin: theme.spacing(0.5),
    },
    chipElement: {
        margin: 3,
        maxWidth: 200,
    },
    padding: {
        padding: '5px',
    },
}));
const filterResults = null;
const GeneratorScalingVariation = ({
   index,
   onChange,
   defaultValue,
   inputForm,
   isDeltaP
}) => {
    const classes = useStyles();

    const [filters, filtersField] = useDirectoryElements({
        label: 'filter',
        initialValues: defaultValue.filters ?? [],
        validation: {
            isFieldRequired: true,
        },
        elementType: elementType.FILTER,
        titleId: 'FiltersListsSelection',
        equipmentTypes: [EquipmentType.GENERATOR],
        filterResults: filterResults,
        elementClassName: classes.chipElement,
    });

    const [variationValue, variationValueField] = useDoubleValue({
        label: isDeltaP ? 'DeltaP' : 'TargetP',
        validation: {
            isFieldRequired: true,
        },
        inputForm: inputForm,
        defaultValue: defaultValue.variationValue ?? '',
    })

    const [variationMode, variationModeField] = useOptionalEnumValue({
        label: 'VariationMode',
        defaultValue: defaultValue?.variationMode ?? 'PROPORTIONAL_TO_PMAX',
        inputForm: inputForm,
        validation: {
            isFieldRequired: true,
        },
        enumObjects: VARIATION_MODE
    })

    useEffect(() => {
        onChange(index, {filters, variationValue, variationMode});
    }, [filters, variationValue, variationMode]);

    return (
        <>
            {gridItem(filtersField, 4)}
            {gridItem(variationValueField, 2)}
            {gridItem(variationModeField, 4)}
        </>
    );
}

const GeneratorScalingDialog = ({
    currentNodeUuid,
    editData,
    ...dialogProps
}) => {
    const classes = useStyles();
    const studyUuid = decodeURIComponent(useParams().studyUuid);

    const { snackError } = useSnackMessage();

    const inputForm = useInputForm();

    const [formValues, setFormValues] = useState(undefined);

    useEffect(() => {
        console.log('test 1')
        if (editData) {
            console.log('test 2', editData)
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

    const [variationType, variationTypeField] = useRadioValue({
        inputForm: inputForm,
        defaultValue: formValues?.variationType ?? 'DELTA_P',
        possibleValues: VARIATION_TYPE
    })

    const [iterativeValue, iterativeField] = useBooleanValue({
        label: 'IterativeLabel',
        defaultValue: formValues?.isIterative ?? true,
        inputForm: inputForm
    });

    const [variations, variationsField] = useExpandableValues({
        id: 'variations',
        labelAddValue: 'CreateVariation',
        validateItem: validateVariation,
        inputForm: inputForm,
        defaultValues: formValues?.generatorScalingVariations,
        Field: GeneratorScalingVariation,
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
        console.log('variation : ', variations);
        generatorScaling(
            studyUuid,
            currentNodeUuid,
            editData?.uuid ?? undefined,
            variationType,
            iterativeValue,
            variations
        ).catch((errorMessage) => {
            snackError({
                messageTxt: errorMessage,
                headerId: 'GeneratorScalingError',
            });
        });
    };

    return (
        <ModificationDialog
            titleId="GeneratorScaling"
            fullWidth={true}
            disabledSave={!inputForm.hasChanged}
            maxWidth={'md'}
            onClear={handleClear}
            onValidation={handleValidation}
            onSave={handleSave}
            {...dialogProps}
        >
            <Grid className={classes.padding}>
                {gridItem(variationTypeField, 8)}
            </Grid>

            <Grid container>
                {gridItem(iterativeField, 8)}
            </Grid>

            <GridSection title="Variations" />
            <Grid container className={classes.padding}>
                {gridItem(variationsField, 12)}
            </Grid>

        </ModificationDialog>
    )
};

export default GeneratorScalingDialog;