/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPE } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import {
    ENABLED,
    LOAD_TAP_CHANGING_CAPABILITIES,
    RATIO_TAP_CHANGER,
    REGULATING,
    REGULATION_SIDE,
    REGULATION_TYPE,
    TARGET_DEADBAND,
    TARGET_V,
} from 'components/refactor/utils/field-constants';
import { useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { gridItem, VoltageAdornment } from '../../../../dialogs/dialogUtils';
import BooleanInput from '../../../rhf-inputs/boolean-input';
import FloatInput from '../../../rhf-inputs/float-input';
import RegulatingTerminalForm from '../../regulating-terminal/regulating-terminal-form';
import RatioTapChangerPaneTaps from './ratio-tap-changer-pane-taps';
import { REGULATION_TYPES, SIDE } from '../../../../network/constants';
import SelectInput from '../../../rhf-inputs/select-input';

const RatioTapChangerPane = ({
    id = RATIO_TAP_CHANGER,
    voltageLevelOptionsPromise,
    voltageLevelsEquipmentsOptionsPromise,
}) => {
    const ratioTapChangerEnabledWatcher = useWatch({
        name: `${id}.${ENABLED}`,
    });

    const ratioTapLoadTapChangingCapabilitiesWatcher = useWatch({
        name: `${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`,
    });

    const regulatingWatch = useWatch({
        name: `${id}.${REGULATING}`,
    });

    const regulationTypeWatch = useWatch({
        name: `${id}.${REGULATION_TYPE}`,
    });

    const ratioTapChangerEnabledField = (
        <BooleanInput
            name={`${id}.${ENABLED}`}
            label="ConfigureRatioTapChanger"
        />
    );

    const ratioTapLoadTapChangingCapabilitiesField = (
        <BooleanInput
            name={`${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`}
            label="OnLoad"
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    const regulatingField = (
        <BooleanInput
            name={`${id}.${REGULATING}`}
            label="VoltageRegulation"
            formProps={{
                disabled:
                    !ratioTapChangerEnabledWatcher ||
                    !ratioTapLoadTapChangingCapabilitiesWatcher,
            }}
        />
    );

    const isVoltageRegulationOn = () => {
        return (
            regulatingWatch &&
            ratioTapLoadTapChangingCapabilitiesWatcher &&
            ratioTapChangerEnabledWatcher
        );
    };

    const regulationTypeField = (
        <SelectInput
            name={`${id}.${REGULATION_TYPE}`}
            label={'RegulationType'}
            options={Object.values(REGULATION_TYPES)}
            disabled={!isVoltageRegulationOn()}
        />
    );

    const sideField = (
        <SelectInput
            name={`${id}.${REGULATION_SIDE}`}
            label={'RegulatedSide'}
            options={Object.values(SIDE)}
            disabled={!regulatingWatch || !ratioTapChangerEnabledWatcher}
        />
    );

    const targetVoltage1Field = (
        <FloatInput
            name={`${id}.${TARGET_V}`}
            label="TargetVoltage"
            adornment={VoltageAdornment}
            formProps={{
                disabled: !regulatingWatch || !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    const targetDeadbandField = (
        <FloatInput
            name={`${id}.${TARGET_DEADBAND}`}
            label="Deadband"
            adornment={VoltageAdornment}
            formProps={{
                disabled: !regulatingWatch || !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            disabled={!ratioTapChangerEnabledWatcher || !regulatingWatch}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
            voltageLevelsEquipmentsOptionsPromise={
                voltageLevelsEquipmentsOptionsPromise
            }
            equipmentSectionTypeDefaultValue={
                EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name
            }
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {ratioTapChangerEnabledField}
                    </Grid>
                </Grid>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {ratioTapLoadTapChangingCapabilitiesField}
                    </Grid>
                </Grid>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {regulatingField}
                    </Grid>
                    <Grid item xs={4}>
                        {regulationTypeField}
                    </Grid>
                </Grid>
                <Grid
                    item
                    container
                    spacing={2}
                    style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        alignItems: 'center',
                    }}
                >
                    {ratioTapLoadTapChangingCapabilitiesWatcher && (
                        <Grid item xs={4}>
                            {targetVoltage1Field}
                        </Grid>
                    )}
                    {ratioTapLoadTapChangingCapabilitiesWatcher && (
                        <Grid item xs={4}>
                            {targetDeadbandField}
                        </Grid>
                    )}
                </Grid>
                {ratioTapLoadTapChangingCapabilitiesWatcher &&
                    regulationTypeWatch === REGULATION_TYPES.DISTANT.id && (
                        <Grid item container spacing={2}>
                            <Grid
                                item
                                xs={4}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                }}
                            >
                                <FormattedMessage
                                    id="DistantRegulatedTerminal"
                                    disabled={true}
                                />
                            </Grid>

                            {gridItem(regulatingTerminalField, 8)}
                        </Grid>
                    )}

                {ratioTapLoadTapChangingCapabilitiesWatcher &&
                    regulationTypeWatch === REGULATION_TYPES.LOCAL.id && (
                        <Grid item container spacing={2}>
                            <Grid
                                item
                                xs={4}
                                style={{
                                    display: 'flex',
                                    justifyContent: 'flex-end',
                                    alignItems: 'center',
                                }}
                            >
                                <FormattedMessage
                                    id="RegulatedTerminal"
                                    disabled={true}
                                />
                            </Grid>

                            {gridItem(sideField, 4)}
                        </Grid>
                    )}

                <RatioTapChangerPaneTaps
                    disabled={!ratioTapChangerEnabledWatcher}
                />
            </Grid>
        </>
    );
};

export default RatioTapChangerPane;
