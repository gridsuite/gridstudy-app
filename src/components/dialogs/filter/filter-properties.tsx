import { useSnackMessage } from '@gridsuite/commons-ui';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useWatch } from 'react-hook-form';
import AddIcon from '@mui/icons-material/Add';
import { FormattedMessage } from 'react-intl';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import FilterProperty, {
    PROPERTY_NAME,
    PROPERTY_VALUES,
    PROPERTY_VALUES_1,
    PROPERTY_VALUES_2,
} from './filter-property';
import {
    CRITERIA_BASED,
    EQUIPMENT_TYPE,
    FILTER_TYPE,
} from '../../utils/field-constants';
import yup from '../../utils/yup-config';
import ErrorInput from '../../utils/rhf-inputs/error-inputs/error-input';
import FieldErrorAlert from '../../utils/rhf-inputs/error-inputs/field-error-alert';
import { ListItem } from '@mui/material';
import { FILTER_TYPES } from 'components/network/constants';
import { areArrayElementsUnique } from 'components/utils/utils';
import { fetchAppsAndUrls } from 'services/utils';

export const FILTER_PROPERTIES = 'freeProperties';

function propertyValuesTest(
    values: (string | undefined)[] | undefined,
    context: yup.TestContext<yup.AnyObject>,
    doublePropertyValues: boolean
) {
    // with context.from[length - 1], we can access to the root fields of the form
    const rootLevelForm = context.from![context.from!.length - 1];
    const filterType = rootLevelForm.value[FILTER_TYPE];
    if (filterType !== FILTER_TYPES.CRITERIA_BASED.id) {
        // we don't test if we are not in a criteria based form
        return true;
    }
    const equipmentType = rootLevelForm.value[EQUIPMENT_TYPE];
    const isForLineOrHvdcLine =
        equipmentType === 'LINE' || equipmentType === 'HVDC_LINE';
    if (doublePropertyValues) {
        return isForLineOrHvdcLine ? values?.length! > 0 : true;
    } else {
        return isForLineOrHvdcLine ? true : values?.length! > 0;
    }
}

export const filterPropertiesYupSchema = {
    [FILTER_PROPERTIES]: yup
        .array()
        .of(
            yup.object().shape({
                [PROPERTY_NAME]: yup.string().required(),
                [PROPERTY_VALUES]: yup
                    .array()
                    .of(yup.string())
                    .test(
                        'can not be empty if not line',
                        'YupRequired',
                        (values, context) =>
                            propertyValuesTest(values, context, false)
                    ),
                [PROPERTY_VALUES_1]: yup
                    .array()
                    .of(yup.string())
                    .test(
                        'can not be empty if line',
                        'YupRequired',
                        (values, context) =>
                            propertyValuesTest(values, context, true)
                    ),
                [PROPERTY_VALUES_2]: yup
                    .array()
                    .of(yup.string())
                    .test(
                        'can not be empty if line',
                        'YupRequired',
                        (values, context) =>
                            propertyValuesTest(values, context, true)
                    ),
            })
        )
        .test(
            'distinct names',
            'filterPropertiesNameUniquenessError',
            (properties, context) => {
                // with context.from[length - 1], we can access to the root fields of the form
                const rootLevelForm = context.from![context.from!.length - 1];
                const filterType = rootLevelForm.value[FILTER_TYPE];
                if (filterType !== FILTER_TYPES.CRITERIA_BASED.id) {
                    // we don't test if we are not in a criteria based form
                    return true;
                }
                const names = properties! // never null / undefined
                    .filter((prop) => !!prop[PROPERTY_NAME])
                    .map((prop) => prop[PROPERTY_NAME]);
                return areArrayElementsUnique(names);
            }
        ),
};

function fetchPredefinedProperties() {
    return fetchAppsAndUrls().then((res) => {
        const studyMetadata = res.find(
            (metadata: any) => metadata.name === 'Study'
        );
        if (!studyMetadata) {
            return Promise.reject(
                'Study entry could not be found in metadatas'
            );
        }

        return studyMetadata?.predefinedEquipmentProperties?.substation;
    });
}

function FilterProperties() {
    const { snackError } = useSnackMessage();

    const watchEquipmentType = useWatch({
        name: EQUIPMENT_TYPE,
    });
    const [fieldProps, setFieldProps] = useState({});

    const fieldName = `${CRITERIA_BASED}.${FILTER_PROPERTIES}`;

    const {
        fields: filterProperties, // don't use it to access form data ! check doc,
        append,
        remove,
    } = useFieldArray({
        name: fieldName,
    });

    const isForLineOrHvdcLine =
        watchEquipmentType === 'LINE' || watchEquipmentType === 'HVDC_LINE';

    const isForSubstation = watchEquipmentType === 'SUBSTATION';

    function addNewProp() {
        if (isForLineOrHvdcLine) {
            append({
                [PROPERTY_NAME]: null,
                [PROPERTY_VALUES_1]: [],
                [PROPERTY_VALUES_2]: [],
            });
        } else {
            append({ [PROPERTY_NAME]: null, [PROPERTY_VALUES]: [] });
        }
    }

    const valuesFields = isForLineOrHvdcLine
        ? [
              { name: PROPERTY_VALUES_1, label: 'PropertyValues1' },
              { name: PROPERTY_VALUES_2, label: 'PropertyValues2' },
          ]
        : [{ name: PROPERTY_VALUES, label: 'PropertyValues' }];

    useEffect(() => {
        fetchPredefinedProperties()
            .then((p) => setFieldProps(p))
            .catch((error) => {
                snackError({
                    messageTxt: error.message ?? error,
                });
            });
    }, [snackError]);

    return (
        watchEquipmentType && (
            <Grid item container spacing={1}>
                <Grid item xs={12}>
                    <FormattedMessage id={'FreePropsCrit'}>
                        {(txt) => <h3>{txt}</h3>}
                    </FormattedMessage>
                    {!isForSubstation && (
                        <FormattedMessage id={'SubstationFreeProps'}>
                            {(txt) => <h4>{txt}</h4>}
                        </FormattedMessage>
                    )}
                </Grid>
                {filterProperties.map((prop, index) => (
                    <ListItem key={prop.id}>
                        <FilterProperty
                            index={index}
                            valuesFields={valuesFields}
                            predefined={fieldProps}
                            handleDelete={remove}
                        />
                    </ListItem>
                ))}
                <Grid item>
                    <Button
                        fullWidth
                        startIcon={<AddIcon />}
                        onClick={addNewProp}
                    >
                        <FormattedMessage id={'AddFreePropCrit'} />
                    </Button>
                </Grid>
                <Grid item>
                    <ErrorInput name={fieldName} InputField={FieldErrorAlert} />
                </Grid>
            </Grid>
        )
    );
}

export default FilterProperties;
