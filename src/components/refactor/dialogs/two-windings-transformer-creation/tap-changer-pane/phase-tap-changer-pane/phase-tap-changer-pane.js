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
    REGULATION_SIDE,
    REGULATION_TYPE,
    TARGET_DEADBAND,
} from 'components/refactor/utils/field-constants';
import { useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import {
    ActivePowerAdornment,
    AmpereAdornment,
    gridItem,
} from '../../../../../dialogs/dialogUtils';
import {
    REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
} from '../../../../../network/constants';
import SwitchInput from '../../../../rhf-inputs/booleans/switch-input';
import FloatInput from '../../../../rhf-inputs/float-input';
import SelectInput from '../../../../rhf-inputs/select-input';
import RegulatingTerminalForm from '../../../regulating-terminal/regulating-terminal-form';
import PhaseTapChangerPaneSteps from './phase-tap-changer-pane-steps';
import { useCallback } from 'react';

const PhaseTapChangerPane = ({
    id = PHASE_TAP_CHANGER,
    studyUuid,
    currentNodeUuid,
    voltageLevelOptions = [],
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

    const regulationTypeWatch = useWatch({
        name: `${id}.${REGULATION_TYPE}`,
    });

    const phaseTapChangerEnabledField = (
        <SwitchInput
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
        <SwitchInput
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

    const isVoltageRegulationOn = useCallback(() => {
        return (
            regulatingWatch &&
            regulationModeWatch !== REGULATION_MODES.FIXED_TAP.id &&
            phaseTapChangerEnabledWatch
        );
    }, [regulatingWatch, regulationModeWatch, phaseTapChangerEnabledWatch]);

    const regulationTypeField = (
        <SelectInput
            name={`${id}.${REGULATION_TYPE}`}
            label={'RegulationType'}
            options={Object.values(REGULATION_TYPES)}
            disabled={!isVoltageRegulationOn()}
            size={'small'}
        />
    );

    const sideField = (
        <SelectInput
            name={`${id}.${REGULATION_SIDE}`}
            label={'RegulatedSide'}
            options={Object.values(SIDE)}
            disabled={!regulatingWatch || !phaseTapChangerEnabledWatch}
            size={'small'}
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
            equipmentSectionTypeDefaultValue={
                EQUIPMENT_TYPE.TWO_WINDINGS_TRANSFORMER.name
            }
            studyUuid={studyUuid}
            currentNodeUuid={currentNodeUuid}
            voltageLevelOptions={voltageLevelOptions}
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
                {regulationModeWatch !== REGULATION_MODES.FIXED_TAP.id &&
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
                                <FormattedMessage id="DistantRegulatedTerminal" />
                            </Grid>
                            {gridItem(regulatingTerminalField, 8)}
                        </Grid>
                    )}
                {regulationModeWatch !== REGULATION_MODES.FIXED_TAP.id &&
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
                                <FormattedMessage id="RegulatedTerminal" />
                            </Grid>
                            {gridItem(sideField, 4)}
                        </Grid>
                    )}

                <PhaseTapChangerPaneSteps
                    disabled={!phaseTapChangerEnabledWatch}
                />
            </Grid>
        </>
    );
};

export default PhaseTapChangerPane;
