import {
    useDirectoryElements,
    useDoubleValue,
    useInputForm,
    useOptionalEnumValue,
    useRadioValue,
} from './inputs/input-hooks';
import { useEffect, useState } from 'react';
import { elementType, useSnackMessage } from '@gridsuite/commons-ui';
import { useParams } from 'react-router-dom';
import ModificationDialog from './modificationDialog';
import { useBooleanValue } from './inputs/boolean';
import Grid from '@mui/material/Grid';
import { gridItem, GridSection } from './dialogUtils';
import { EquipmentType } from './sensi/sensi-parameters-selector';
import { VARIATION_MODE, VARIATION_TYPE } from '../network/constants';
import { useExpandableValues } from './inputs/use-expandable-values';
import makeStyles from '@mui/styles/makeStyles';
import { generatorScaling } from '../../utils/rest-api';

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

const IDENTIFIER_LIST = 'IDENTIFIER_LIST';
const VENTILATION = 'VENTILATION';
const STACKING_UP = 'STACKING_UP';
const PROPORTIONAL_TO_PMAX = 'PROPORTIONAL_TO_PMAX';

const GeneratorScalingVariation = ({
    index,
    onChange,
    defaultValue,
    inputForm,
    errors,
    fieldProps,
}) => {
    const classes = useStyles();

    const [variationMode, variationModeField] = useOptionalEnumValue({
        label: 'VariationMode',
        defaultValue: defaultValue?.variationMode ?? PROPORTIONAL_TO_PMAX,
        inputForm: inputForm,
        validation: {
            isFieldRequired: true,
        },
        enumObjects: VARIATION_MODE,
        errorMsg: errors?.variationModeError,
    });

    function itemFilter(value) {
        if (variationMode === STACKING_UP) {
            return value?.specificMetadata?.type === IDENTIFIER_LIST;
        }

        if (variationMode === VENTILATION) {
            return (
                value?.specificMetadata?.type === IDENTIFIER_LIST &&
                value?.specificMetadata?.filterEquipmentsAttributes?.every(
                    (fil) => !!fil.distributionKey
                )
            );
        }

        return true;
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
        itemFilter: itemFilter,
        elementClassName: classes.chipElement,
        required: true,
        errorMsg: errors?.filterError,
    });

    const [variationValue, variationValueField] = useDoubleValue({
        label: fieldProps.isDeltaP ? 'DeltaP' : 'TargetPText',
        validation: {
            isFieldRequired: true,
        },
        inputForm: inputForm,
        defaultValue: defaultValue.variationValue ?? '',
        errorMsg: errors?.variationValueError,
    });

    useEffect(() => {
        onChange(index, { filters, variationValue, variationMode });
    }, [onChange, filters, variationValue, variationMode, index]);

    return (
        <>
            {gridItem(filtersField, 4)}
            {gridItem(variationValueField, 2)}
            {gridItem(variationModeField, 4)}
        </>
    );
};

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
        if (editData) {
            setFormValues(editData);
        }
    }, [editData]);

    function validateVariation(values) {
        const res = new Map();
        values.forEach((val, idx) => {
            const errorId = 'FieldIsRequired';
            if (!val.filters || val.filters.length < 1) {
                res.set(idx, {
                    error: true,
                    filterError: errorId,
                });
            }
            if (!val.variationValue) {
                res.set(idx, {
                    ...res.get(idx),
                    error: true,
                    variationValueError: errorId,
                });
            }

            if (!val.variationMode) {
                res.set(idx, {
                    ...res.get(idx),
                    error: true,
                    variationModeError: errorId,
                });
            }
        });
        return res;
    }

    const [variationType, variationTypeField] = useRadioValue({
        inputForm: inputForm,
        defaultValue: formValues?.variationType ?? 'DELTA_P',
        possibleValues: VARIATION_TYPE,
    });

    const [iterativeValue, iterativeField] = useBooleanValue({
        label: 'IterativeLabel',
        defaultValue: formValues?.isIterative ?? true,
        inputForm: inputForm,
    });

    const [variations, variationsField] = useExpandableValues({
        id: 'variations',
        labelAddValue: 'CreateVariation',
        validateItem: validateVariation,
        inputForm: inputForm,
        defaultValues: formValues?.variations,
        Field: GeneratorScalingVariation,
        isRequired: true,
        fieldProps: { isDeltaP: variationType === 'DELTA_P' },
    });

    const handleClear = () => {
        inputForm.reset();
        setFormValues(null);
    };

    const handleValidation = () => {
        return inputForm.validate();
    };

    const handleSave = () => {
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

            <Grid container>{gridItem(iterativeField, 8)}</Grid>

            <GridSection title="Variations" />
            <Grid container className={classes.padding}>
                {gridItem(variationsField, 12)}
            </Grid>
        </ModificationDialog>
    );
};

export default GeneratorScalingDialog;
