/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    ENABLED,
    LOAD_TAP_CHANGING_CAPABILITIES,
    RATIO_TAP_CHANGER,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    TARGET_DEADBAND,
    TARGET_V,
} from 'components/refactor/utils/field-constants';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage } from 'react-intl';
import { gridItem, VoltageAdornment } from '../../../../../dialogs/dialogUtils';
import SwitchInput from '../../../../rhf-inputs/booleans/switch-input';
import FloatInput from '../../../../rhf-inputs/float-input';
import RegulatingTerminalForm from '../../../regulating-terminal/regulating-terminal-form';
import RatioTapChangerPaneSteps from './ratio-tap-changer-pane-steps';
import {
    RATIO_REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
} from '../../../../../network/constants';
import SelectInput from '../../../../rhf-inputs/select-input';
import { EQUIPMENT_TYPES } from 'components/util/equipment-types';

const RatioTapChangerPane = ({
    id = RATIO_TAP_CHANGER,
    studyUuid,
    currentNodeUuid,
    voltageLevelOptions = [],
}) => {
    const { trigger } = useFormContext();

    const ratioTapChangerEnabledWatcher = useWatch({
        name: `${id}.${ENABLED}`,
    });

    const ratioTapLoadTapChangingCapabilitiesWatcher = useWatch({
        name: `${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`,
    });

    // we use this to force rerender when regulation mode change,
    // and then update the "optional" in label of target voltage field
    const regulationModeWatch = useWatch({
        name: `${id}.${REGULATION_MODE}`,
    });

    const regulationTypeWatch = useWatch({
        name: `${id}.${REGULATION_TYPE}`,
    });

    // we want to update the validation of these fields when they become optionals to remove the red alert
    useEffect(() => {
        if (regulationModeWatch === RATIO_REGULATION_MODES.FIXED_RATIO.id) {
            trigger(`${id}.${REGULATION_TYPE}`);
            trigger(`${id}.${REGULATION_SIDE}`);
            trigger(`${id}.${TARGET_V}`);
        }
    }, [regulationModeWatch, trigger, id]);

    const ratioTapLoadTapChangingCapabilitiesField = (
        <SwitchInput
            name={`${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`}
            label="OnLoad"
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
        />
    );

    const regulationModeField = (
        <SelectInput
            name={`${id}.${REGULATION_MODE}`}
            label={'RegulationMode'}
            options={Object.values(RATIO_REGULATION_MODES)}
            disabled={
                !ratioTapChangerEnabledWatcher ||
                !ratioTapLoadTapChangingCapabilitiesWatcher
            }
        />
    );

    const regulationTypeField = (
        <SelectInput
            name={`${id}.${REGULATION_TYPE}`}
            label={'RegulationTypeText'}
            options={Object.values(REGULATION_TYPES)}
            disabled={
                !ratioTapChangerEnabledWatcher ||
                !ratioTapLoadTapChangingCapabilitiesWatcher
            }
            size={'small'}
        />
    );

    const sideField = (
        <SelectInput
            name={`${id}.${REGULATION_SIDE}`}
            label={'RegulatedSide'}
            options={Object.values(SIDE)}
            disabled={
                !ratioTapChangerEnabledWatcher ||
                !ratioTapLoadTapChangingCapabilitiesWatcher
            }
            size={'small'}
        />
    );

    const targetVoltage1Field = (
        <FloatInput
            name={`${id}.${TARGET_V}`}
            label="TargetVoltage"
            adornment={VoltageAdornment}
            formProps={{
                disabled:
                    !ratioTapChangerEnabledWatcher ||
                    !ratioTapLoadTapChangingCapabilitiesWatcher,
            }}
        />
    );

    const targetDeadbandField = (
        <FloatInput
            name={`${id}.${TARGET_DEADBAND}`}
            label="Deadband"
            adornment={VoltageAdornment}
            formProps={{
                disabled:
                    !ratioTapChangerEnabledWatcher ||
                    !ratioTapLoadTapChangingCapabilitiesWatcher,
            }}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            disabled={
                !ratioTapChangerEnabledWatcher ||
                !ratioTapLoadTapChangingCapabilitiesWatcher
            }
            equipmentSectionTypeDefaultValue={
                EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type
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
                        {ratioTapLoadTapChangingCapabilitiesField}
                    </Grid>
                    {ratioTapLoadTapChangingCapabilitiesWatcher && (
                        <Grid item xs={4}>
                            {regulationModeField}
                        </Grid>
                    )}
                </Grid>
                {ratioTapLoadTapChangingCapabilitiesWatcher && (
                    <Grid item container spacing={2}>
                        <Grid item xs={4}>
                            {regulationTypeField}
                        </Grid>
                        <Grid item xs={4}>
                            {targetVoltage1Field}
                        </Grid>
                        <Grid item xs={4}>
                            {targetDeadbandField}
                        </Grid>
                    </Grid>
                )}
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
                <RatioTapChangerPaneSteps
                    disabled={!ratioTapChangerEnabledWatcher}
                />
            </Grid>
        </>
    );
};

export default RatioTapChangerPane;
