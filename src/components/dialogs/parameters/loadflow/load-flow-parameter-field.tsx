/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

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
import LineSeparator from 'components/dialogs/commons/line-separator';
import { ParameterType } from '../parameters.type';
import { styles } from '../parameters-style';

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
            case ParameterType.STRING:
                return possibleValues ? (
                    <MuiSelectInput name={`${id}.${name}`} options={possibleValues} size="small" />
                ) : (
                    <TextInput name={`${id}.${name}`} />
                );
            case ParameterType.BOOLEAN:
                return <SwitchInput name={`${id}.${name}`} />;
            case ParameterType.COUNTRIES:
                return <CountriesInput name={`${id}.${name}`} label={'descLfCountries'} />;
            case ParameterType.DOUBLE:
                return <FloatInput name={`${id}.${name}`} />;
            case ParameterType.STRING_LIST:
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
            case ParameterType.INTEGER:
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
