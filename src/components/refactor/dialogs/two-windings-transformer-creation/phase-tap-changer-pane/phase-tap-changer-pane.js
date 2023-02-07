/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { EQUIPMENT_TYPE } from '@gridsuite/commons-ui';
import { Grid } from '@mui/material';
import {
    CURRENT_LIMITER_REGULATING_VALUE,
    ENABLED,
    FLOW_SET_POINT_REGULATING_VALUE,
    PHASE_TAP_CHANGER,
    REGULATING,
    REGULATION_MODE,
    TARGET_DEADBAND,
} from 'components/refactor/utils/field-constants';
import { useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import {
    ActivePowerAdornment,
    AmpereAdornment,
    gridItem,
} from '../../../../dialogs/dialogUtils';
import { REGULATION_MODES } from '../../../../network/constants';
import BooleanInput from '../../../rhf-inputs/boolean-input';
import FloatInput from '../../../rhf-inputs/float-input';
import SelectInput from '../../../rhf-inputs/select-input';
import RegulatingTerminalForm from '../../regulating-terminal/regulating-terminal-form';
import PhaseTapChangerPaneTaps from './phase-tap-changer-pane-taps';

const PhaseTapChangerPane = ({
    id = PHASE_TAP_CHANGER,
    voltageLevelOptionsPromise,
}) => {
    const phaseTapChangerEnabledWatch = useWatch({
        name: `${id}.${ENABLED}`,
    });

    const regulationModeWatch = useWatch({
        name: `${id}.${REGULATION_MODE}`,
    });

    const regulatingWatch = useWatch({
        name: `${id}.${REGULATING}`,
    });

    const phaseTapChangerEnabledField = (
        <BooleanInput
            name={`${id}.${ENABLED}`}
            label="ConfigurePhaseTapChanger"
        />
    );

    const regulationModeField = (
        <SelectInput
            name={`${id}.${REGULATION_MODE}`}
            label={'RegulationMode'}
            options={Object.values(REGULATION_MODES)}
            disabled={!phaseTapChangerEnabledWatch}
        />
    );

    const regulatingField = (
        <BooleanInput
            name={`${id}.${REGULATING}`}
            label="Regulating"
            formProps={{
                disabled:
                    !(
                        regulationModeWatch ===
                            REGULATION_MODES.CURRENT_LIMITER.id ||
                        regulationModeWatch ===
                            REGULATION_MODES.ACTIVE_POWER_CONTROL.id
                    ) || !phaseTapChangerEnabledWatch,
            }}
        />
    );

    const currentLimiterRegulatingValueField = (
        <FloatInput
            name={`${id}.${CURRENT_LIMITER_REGULATING_VALUE}`}
            label="RegulatingValueCurrentLimiter"
            formProps={{
                disabled: !regulatingWatch || !phaseTapChangerEnabledWatch,
            }}
            adornment={AmpereAdornment}
        />
    );

    const flowSetPointRegulatingValueField = (
        <FloatInput
            name={`${id}.${FLOW_SET_POINT_REGULATING_VALUE}`}
            label="RegulatingValueActivePowerControl"
            adornment={ActivePowerAdornment}
            formProps={{
                disabled: !regulatingWatch || !phaseTapChangerEnabledWatch,
            }}
        />
    );

    const targetDeadbandField = (
        <FloatInput
            name={`${id}.${TARGET_DEADBAND}`}
            label="Deadband"
            adornment={ActivePowerAdornment}
            formProps={{
                disabled: !regulatingWatch || !phaseTapChangerEnabledWatch,
            }}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            disabled={!regulatingWatch || !phaseTapChangerEnabledWatch}
            voltageLevelOptionsPromise={voltageLevelOptionsPromise}
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
                        {phaseTapChangerEnabledField}
                    </Grid>
                </Grid>
                <Grid item xs={4}>
                    {gridItem(regulationModeField, 12)}
                </Grid>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {regulatingField}
                    </Grid>
                    {regulationModeWatch !== REGULATION_MODES.FIXED_TAP.id && (
                        <Grid item xs={4}>
                            {regulationModeWatch !==
                                REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
                                currentLimiterRegulatingValueField}
                            {regulationModeWatch ===
                                REGULATION_MODES.ACTIVE_POWER_CONTROL.id &&
                                flowSetPointRegulatingValueField}
                        </Grid>
                    )}

                    {regulationModeWatch !== REGULATION_MODES.FIXED_TAP.id && (
                        <Grid item xs={4}>
                            {targetDeadbandField}
                        </Grid>
                    )}
                </Grid>
                {regulationModeWatch !== REGULATION_MODES.FIXED_TAP.id && (
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
                            <FormattedMessage id="TerminalRef" />
                        </Grid>

                        {gridItem(regulatingTerminalField, 8)}
                    </Grid>
                )}
                <PhaseTapChangerPaneTaps
                    disabled={!phaseTapChangerEnabledWatch}
                />
            </Grid>
        </>
    );
};

export default PhaseTapChangerPane;
