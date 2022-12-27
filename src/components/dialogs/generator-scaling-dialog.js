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
   isDeltaP,
   errors,
}) => {
    const classes = useStyles();

    useEffect(() => {
        console.log('errors : ', errors);
    }, [errors]);

    const onError = (event) => {
        console.log('event : ', event)
    }

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
        required: true,
        errorMsg: errors?.filterError,
        onError: onError,
    });

    const [variationValue, variationValueField] = useDoubleValue({
        label: isDeltaP ? 'DeltaP' : 'TargetP',
        validation: {
            isFieldRequired: true,
        },
        inputForm: inputForm,
        defaultValue: defaultValue.variationValue ?? '',
        errorMsg: errors?.validationValueError
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
        console.log('scale test validation values ', values)
        const newValues = values.map((val) => {
            val.id = val.id ?? Math.random();
            return val;
        })

        const res = new Map();

        console.log('scale test validation newValues ', newValues)
        newValues.forEach((val, idx) => {
            console.log("test val , ", val)
            const errorId = 'FieldIsRequired';
            if(!val.filters || val.filters.length < 1) {
                res.set(idx, {
                    error: true,
                    filterError: errorId,
                })
            }
            if (!val.variationValue) {
                res.set(idx, {
                    ...res.get(idx),
                    error: true,
                    validationValueError: errorId,
                })
            }
        });

        console.log('scale test validation res ', res)
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
        console.log('variation : ', variations, iterativeValue);
        console.log('variation : ', variations, iterativeValue);
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