import { FunctionComponent } from 'react';
import { Grid, Tooltip, Chip, Typography } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import {
    AutocompleteInput,
    CountriesInput,
    FloatInput,
    IntegerInput,
    MuiSelectInput,
    MultipleAutocompleteInput,
    SwitchInput,
    TextInput,
} from '@gridsuite/commons-ui';
import { styles } from '../parameters';
import LineSeparator from 'components/dialogs/commons/line-separator';
import { TYPES } from './load-flow-parameters-utils';

interface LoadFlowParameterFieldProps {
    id: string;
    name: string;
    type: string;
    label?: string;
    description?: string;
    possibleValues?: { id: string; label: string }[] | string[];
}

const LoadFlowParameterField: FunctionComponent<LoadFlowParameterFieldProps> = ({
    id,
    name,
    type,
    label,
    description,
    possibleValues,
}) => {
    const renderField = () => {
        switch (type) {
            case TYPES.STRING:
                return possibleValues ? (
                    <MuiSelectInput name={`${id}.${name}`} options={possibleValues} size="small" />
                ) : (
                    <TextInput name={`${id}.${name}`} />
                );
            case TYPES.BOOLEAN:
                return <SwitchInput name={`${id}.${name}`} />;
            case TYPES.COUNTRIES:
                return <CountriesInput name={`${id}.${name}`} label={'descLfCountries'} />;
            case TYPES.DOUBLE:
                return <FloatInput name={`${id}.${name}`} />;
            case TYPES.STRING_LIST:
                return possibleValues ? (
                    <AutocompleteInput
                        name={`${id}.${name}`}
                        label={label}
                        options={possibleValues}
                        fullWidth
                        multiple
                        size="small"
                        renderTags={(val: any[], getTagsProps: any) =>
                            val.map((code: string, index: number) => (
                                <Chip key={code} size="small" label={code} {...getTagsProps({ index })} />
                            ))
                        }
                    />
                ) : (
                    <MultipleAutocompleteInput name={`${id}.${name}`} size="small" />
                );
            case TYPES.INTEGER:
                return <IntegerInput name={`${id}.${name}`} />;
            default:
                return null;
        }
    };

    return (
        <Grid container spacing={1} paddingTop={1} key={name} justifyContent={'space-between'}>
            <Grid item xs={8}>
                <Tooltip title={description} enterDelay={1200} key={name}>
                    <Typography sx={styles.parameterName}>
                        {label ? <FormattedMessage id={label}></FormattedMessage> : name}
                    </Typography>
                </Tooltip>
            </Grid>
            <Grid item container xs={4} sx={styles.controlItem}>
                {renderField()}
            </Grid>
            <LineSeparator />
        </Grid>
    );
};

export default LoadFlowParameterField;
