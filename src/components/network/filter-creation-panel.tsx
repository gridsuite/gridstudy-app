import React, { BaseSyntheticEvent } from 'react';
import { Box, Button } from '@mui/material';
import Grid from '@mui/material/Grid';
import { SelectInput, SubmitButton } from '@gridsuite/commons-ui';
import { yupResolver } from '@hookform/resolvers/yup';
import yup from 'components/utils/yup-config';
import { FormProvider, useForm } from 'react-hook-form';
import { FILTER_NAME } from 'components/utils/field-constants';
import { GridSection, gridItem } from 'components/dialogs/dialogUtils';

const EXPERT_FILTER_EQUIPMENTS = {
    GENERATOR: {
        id: 'GENERATOR',
        label: 'Generators',
    },
    LOAD: {
        id: 'LOAD',
        label: 'Loads',
    },
    BATTERY: {
        id: 'BATTERY',
        label: 'Batteries',
    },
    VOLTAGE_LEVEL: {
        id: 'VOLTAGE_LEVEL',
        label: 'VoltageLevels',
    },
    SUBSTATION: {
        id: 'SUBSTATION',
        label: 'Substations',
    },
    SHUNT_COMPENSATOR: {
        id: 'SHUNT_COMPENSATOR',
        label: 'ShuntCompensators',
    },
    LINE: {
        id: 'LINE',
        label: 'Lines',
    },
    TWO_WINDINGS_TRANSFORMER: {
        id: 'TWO_WINDINGS_TRANSFORMER',
        label: 'TwoWindingsTransformers',
    },
};

const formSchema = yup
    .object()
    .shape({
        [FILTER_NAME]: yup.string().nullable(),
        equipmentType: yup.string().nullable(),
    })
    .required();
const emptyFormData = {
    [FILTER_NAME]: '',
    equipmentType: '',
};
const FilterCreationPanel: React.FC = () => {
    const formMethods = useForm({
        defaultValues: emptyFormData,
        resolver: yupResolver(formSchema),
    });
    // const { handleSubmit } = useFormContext();

    const handleValidationButtonClick = () => {
        // Perform validation logic here
    };

    return (
        <>
            <Grid container spacing={2}>
                <FormProvider
                    {...{
                        validationSchema: formSchema,
                        removeOptional: true,
                        ...formMethods,
                    }}
                >
                    <GridSection title="Filter creation" />
                    <Grid item>
                        <SelectInput
                            name={'equipmentType'}
                            options={Object.values(EXPERT_FILTER_EQUIPMENTS)}
                            label={'equipmentType'}
                            fullWidth
                            size={'small'}
                            disableClearable={true}
                            formProps={{ style: { fontStyle: 'italic' } }}
                        />
                    </Grid>
                    <Grid item>
                        <Button
                            variant="contained"
                            onClick={handleValidationButtonClick}
                        >
                            Validate
                        </Button>
                    </Grid>
                </FormProvider>
            </Grid>
        </>
    );
};

export default FilterCreationPanel;
