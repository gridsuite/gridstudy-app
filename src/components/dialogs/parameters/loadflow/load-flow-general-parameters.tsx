/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FunctionComponent, memo } from 'react';
import { Chip, Grid, Tooltip } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { styles } from '../parameters';
import Typography from '@mui/material/Typography';

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
import {
    BALANCE_TYPE,
    COMMON_PARAMETERS,
    CONNECTED_COMPONENT_MODE,
    COUNTRIES_TO_BALANCE,
    DC,
    DC_POWER_FACTOR,
    DC_USE_TRANSFORMER_RATIO,
    DISTRIBUTED_SLACK,
    HVDC_AC_EMULATION,
    PHASE_SHIFTER_REGULATION_ON,
    READ_SLACK_BUS,
    SHUNT_COMPENSATOR_VOLTAGE_CONTROL_ON,
    SPECIFIC_PARAMETERS,
    TRANSFORMER_VOLTAGE_CONTROL_ON,
    TWT_SPLIT_SHUNT_ADMITTANCE,
    TYPES,
    USE_REACTIVE_LIMITS,
    VOLTAGE_INIT_MODE,
    WRITE_SLACK_BUS,
} from './load-flow-parameters-utils';
import { ParameterGroup } from '../widget';
import { useLoadFlowContext } from './load-flow-parameters-context';

interface LoadFlowFieldsProps {
    id: string;
    item: FieldToShow;
}

const LoadFlowFields: FunctionComponent<LoadFlowFieldsProps> = ({ id, item }) => {
    const { name, type, label, description, possibleValues } = item;
    const renderField = () => {
        switch (type) {
            case TYPES.STRING: {
                if (possibleValues) {
                    return <MuiSelectInput name={`${id}.${name}`} options={possibleValues} size="small" />;
                } else {
                    return <TextInput name={`${id}.${name}`} />;
                }
            }
            case TYPES.BOOLEAN:
                return <SwitchInput name={`${id}.${name}`} />;
            case TYPES.COUNTRIES:
                return <CountriesInput name={`${id}.${name}`} label={'descLfCountries'} />;
            case TYPES.DOUBLE:
                return <FloatInput name={`${id}.${name}`} />;
            case TYPES.STRING_LIST: {
                if (possibleValues) {
                    return (
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
                    );
                } else {
                    return <MultipleAutocompleteInput name={`${id}.${name}`} size="small" />;
                }
            }
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

interface FieldToShow {
    name: string;
    type: string;
    description?: string;
    label?: string;
    possibleValues?: { id: string; label: string }[] | string[];
}

const basicParams: FieldToShow[] = [
    {
        name: TRANSFORMER_VOLTAGE_CONTROL_ON,
        type: TYPES.BOOLEAN,
        label: 'descLfTransformerVoltageControlOn',
    },
    {
        name: PHASE_SHIFTER_REGULATION_ON,
        type: TYPES.BOOLEAN,
        label: 'descLfPhaseShifterRegulationOn',
    },
    {
        name: DC,
        type: TYPES.BOOLEAN,
        label: 'descLfDC',
    },
    {
        name: BALANCE_TYPE,
        type: TYPES.STRING,
        label: 'descLfBalanceType',
        possibleValues: [
            { id: 'PROPORTIONAL_TO_GENERATION_P', label: 'descLfBalanceTypeGenP' },
            { id: 'PROPORTIONAL_TO_GENERATION_P_MAX', label: 'descLfBalanceTypeGenPMax' },
            { id: 'PROPORTIONAL_TO_LOAD', label: 'descLfBalanceTypeLoad' },
            { id: 'PROPORTIONAL_TO_CONFORM_LOAD', label: 'descLfBalanceTypeConformLoad' },
        ],
    },
    {
        name: COUNTRIES_TO_BALANCE,
        type: TYPES.COUNTRIES,
        label: 'descLfCountriesToBalance',
    },
    {
        name: CONNECTED_COMPONENT_MODE,
        type: TYPES.STRING,
        label: 'descLfConnectedComponentMode',
        possibleValues: [
            {
                id: 'MAIN',
                label: 'descLfConnectedComponentModeMain',
            },
            {
                id: 'ALL',
                label: 'descLfConnectedComponentModeAll',
            },
        ],
    },
    {
        name: HVDC_AC_EMULATION,
        type: TYPES.BOOLEAN,
        label: 'descLfHvdcAcEmulation',
    },
];

const fieldsToShow: FieldToShow[] = [
    {
        name: VOLTAGE_INIT_MODE,
        type: TYPES.STRING,
        label: 'descLfVoltageInitMode',
        possibleValues: [
            {
                id: 'UNIFORM_VALUES',
                label: 'descLfUniformValues',
            },
            {
                id: 'PREVIOUS_VALUES',
                label: 'descLfPreviousValues',
            },
            {
                id: 'DC_VALUES',
                label: 'descLfDcValues',
            },
        ],
    },
    {
        name: USE_REACTIVE_LIMITS,
        type: TYPES.BOOLEAN,
        label: 'descLfUseReactiveLimits',
    },
    {
        name: TWT_SPLIT_SHUNT_ADMITTANCE,
        type: TYPES.BOOLEAN,
        label: 'descLfTwtSplitShuntAdmittance',
    },
    {
        name: READ_SLACK_BUS,
        type: TYPES.BOOLEAN,
        label: 'descLfReadSlackBus',
    },
    {
        name: WRITE_SLACK_BUS,
        type: TYPES.BOOLEAN,
        label: 'descLfWriteSlackBus',
    },
    {
        name: DISTRIBUTED_SLACK,
        type: TYPES.BOOLEAN,
        label: 'descLfDistributedSlack',
    },
    {
        name: SHUNT_COMPENSATOR_VOLTAGE_CONTROL_ON,
        type: TYPES.BOOLEAN,
        label: 'descLfShuntCompensatorVoltageControlOn',
    },
    {
        name: DC_USE_TRANSFORMER_RATIO,
        type: TYPES.BOOLEAN,
        label: 'descLfDcUseTransformerRatio',
    },
    {
        name: DC_POWER_FACTOR,
        type: TYPES.DOUBLE,
        label: 'descLfDcPowerFactor',
    },
];

interface LoadFlowGeneralParametersProps {
    provider: string;
    specificParams: FieldToShow[];
}

const LoadFlowGeneralParameters: FunctionComponent<LoadFlowGeneralParametersProps> = ({ provider, specificParams }) => {
    const { showAdvancedLfParams, setShowAdvancedLfParams, showSpecificLfParams, setShowSpecificLfParams } =
        useLoadFlowContext();
    return (
        <>
            {Object.values(basicParams).map((item) => {
                return <LoadFlowFields id={COMMON_PARAMETERS} item={item} key={item.name} />;
            })}
            <ParameterGroup
                label="showAdvancedParameters"
                state={showAdvancedLfParams}
                onClick={setShowAdvancedLfParams}
            >
                {showAdvancedLfParams &&
                    fieldsToShow.map((item) => {
                        return <LoadFlowFields id={COMMON_PARAMETERS} item={item} key={item.name} />;
                    })}
            </ParameterGroup>
            <ParameterGroup
                label="showSpecificParameters"
                state={showSpecificLfParams}
                onClick={setShowSpecificLfParams}
                infoText={provider ?? ''}
            >
                {showSpecificLfParams &&
                    specificParams?.map((item) => (
                        <LoadFlowFields id={SPECIFIC_PARAMETERS} item={item} key={item.name} />
                    ))}
            </ParameterGroup>
        </>
    );
};

export default memo(LoadFlowGeneralParameters);
