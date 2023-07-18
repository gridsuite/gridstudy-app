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
    REGULATING,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    TARGET_DEADBAND,
    TARGET_V,
} from 'components/utils/field-constants';
import { useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { gridItem, VoltageAdornment } from '../../../../../dialogUtils';
import SwitchInput from 'components/utils/rhf-inputs/booleans/switch-input';
import FloatInput from 'components/utils/rhf-inputs/float-input';
import RegulatingTerminalForm from '../../../../../regulating-terminal/regulating-terminal-form';
import RatioTapChangerPaneSteps from './ratio-tap-changer-pane-steps';
import {
    RATIO_REGULATION_MODES,
    REGULATION_TYPES,
    SIDE,
} from 'components/network/constants';
import SelectInput from 'components/utils/rhf-inputs/select-input';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import CheckboxNullableInput from 'components/utils/rhf-inputs/boolean-nullable-input';

export const previousRegulationType = (previousValues) => {
    if (
        !previousValues?.[RATIO_TAP_CHANGER]?.[
            LOAD_TAP_CHANGING_CAPABILITIES
        ] ||
        !previousValues?.[RATIO_TAP_CHANGER]?.regulatingTerminalConnectableId
    ) {
        return null;
    }
    if (
        previousValues?.[RATIO_TAP_CHANGER]?.regulatingTerminalConnectableId !==
        previousValues?.id
    ) {
        return REGULATION_TYPES.DISTANT.id;
    } else {
        return REGULATION_TYPES.LOCAL.id;
    }
};

const RatioTapChangerPane = ({
    id = RATIO_TAP_CHANGER,
    studyUuid,
    currentNodeUuid,
    voltageLevelOptions = [],
    previousValues,
    modification = false,
}) => {
    const { trigger } = useFormContext();
    const intl = useIntl();

    const previousRegulation = () => {
        if (
            previousValues?.[RATIO_TAP_CHANGER]?.[
                LOAD_TAP_CHANGING_CAPABILITIES
            ]
        ) {
            return intl.formatMessage({ id: 'On' });
        }
        if (
            previousValues?.[RATIO_TAP_CHANGER]?.[
                LOAD_TAP_CHANGING_CAPABILITIES
            ] === false
        ) {
            return intl.formatMessage({ id: 'Off' });
        }
        return null;
    };

    const getRatioTapChangerRegulationModeLabel = (
        ratioTapChangerFormValues
    ) => {
        if (!ratioTapChangerFormValues) {
            return null;
        }
        if (ratioTapChangerFormValues?.[REGULATING]) {
            return intl.formatMessage({
                id: RATIO_REGULATION_MODES.VOLTAGE_REGULATION.label,
            });
        } else {
            return intl.formatMessage({
                id: RATIO_REGULATION_MODES.FIXED_RATIO.label,
            });
        }
    };

    const getRegulationTypeLabel = (twt, tap) => {
        if (tap?.regulatingTerminalConnectableId != null) {
            return tap?.regulatingTerminalConnectableId === twt?.id
                ? intl.formatMessage({ id: REGULATION_TYPES.LOCAL.label })
                : intl.formatMessage({ id: REGULATION_TYPES.DISTANT.label });
        } else {
            return null;
        }
    };

    const getTapSideLabel = (twt, tap) => {
        if (!tap || !twt) {
            return null;
        }
        if (tap?.regulatingTerminalConnectableId === twt?.id) {
            return tap?.regulatingTerminalVlId === twt?.voltageLevelId1
                ? intl.formatMessage({ id: SIDE.SIDE1.label })
                : intl.formatMessage({ id: SIDE.SIDE2.label });
        } else {
            return null;
        }
    };

    const ratioTapChangerEnabledWatcher = useWatch({
        name: `${id}.${ENABLED}`,
    });

    const ratioTapLoadTapChangingCapabilitiesWatcher = useWatch({
        name: `${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`,
    });

    const isRatioTapLoadTapChangingCapabilitiesOn =
        ratioTapLoadTapChangingCapabilitiesWatcher ||
        (ratioTapLoadTapChangingCapabilitiesWatcher === null &&
            previousValues?.[RATIO_TAP_CHANGER]?.[
                LOAD_TAP_CHANGING_CAPABILITIES
            ] === true);

    // we use this to force rerender when regulation mode change,
    // and then update the "optional" in label of target voltage field
    const regulationModeWatch = useWatch({
        name: `${id}.${REGULATION_MODE}`,
    });

    const regulationTypeWatch = useWatch({
        name: `${id}.${REGULATION_TYPE}`,
    });

    const regulationType = useMemo(() => {
        return regulationTypeWatch
            ? regulationTypeWatch
            : previousRegulationType(previousValues);
    }, [previousValues, regulationTypeWatch]);

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

    const ratioTapLoadTapChangingCapabilitiesModificationField = (
        <CheckboxNullableInput
            name={`${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`}
            label="OnLoad"
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
            previousValue={previousRegulation()}
        />
    );

    const regulationModeField = (
        <SelectInput
            name={`${id}.${REGULATION_MODE}`}
            label={'RegulationMode'}
            options={Object.values(RATIO_REGULATION_MODES)}
            disabled={
                !ratioTapChangerEnabledWatcher ||
                !isRatioTapLoadTapChangingCapabilitiesOn
            }
            previousValue={getRatioTapChangerRegulationModeLabel(
                previousValues?.[RATIO_TAP_CHANGER]
            )}
        />
    );

    const regulationTypeField = (
        <SelectInput
            name={`${id}.${REGULATION_TYPE}`}
            label={'RegulationTypeText'}
            options={Object.values(REGULATION_TYPES)}
            disabled={
                !ratioTapChangerEnabledWatcher ||
                !isRatioTapLoadTapChangingCapabilitiesOn
            }
            size={'small'}
            previousValue={getRegulationTypeLabel(
                previousValues,
                previousValues?.[RATIO_TAP_CHANGER]
            )}
        />
    );

    const sideField = (
        <SelectInput
            name={`${id}.${REGULATION_SIDE}`}
            label={'RegulatedSide'}
            options={Object.values(SIDE)}
            disabled={
                !ratioTapChangerEnabledWatcher ||
                !isRatioTapLoadTapChangingCapabilitiesOn
            }
            size={'small'}
            previousValue={getTapSideLabel(
                previousValues,
                previousValues?.[RATIO_TAP_CHANGER]
            )}
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
                    !isRatioTapLoadTapChangingCapabilitiesOn,
            }}
            previousValue={previousValues?.[RATIO_TAP_CHANGER]?.[TARGET_V]}
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
                    !isRatioTapLoadTapChangingCapabilitiesOn,
            }}
            previousValue={previousValues?.[RATIO_TAP_CHANGER]?.targetDeadBand}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            disabled={
                !ratioTapChangerEnabledWatcher ||
                !isRatioTapLoadTapChangingCapabilitiesOn
            }
            equipmentSectionTypeDefaultValue={
                EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER.type
            }
            studyUuid={studyUuid}
            currentNodeUuid={currentNodeUuid}
            voltageLevelOptions={voltageLevelOptions}
            previousRegulatingTerminalValue={
                previousValues?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId
            }
            previousEquipmentSectionTypeValue={
                previousValues?.[RATIO_TAP_CHANGER]
                    ?.regulatingTerminalConnectableType
                    ? previousValues?.[RATIO_TAP_CHANGER]
                          ?.regulatingTerminalConnectableType +
                      ' : ' +
                      previousValues?.[RATIO_TAP_CHANGER]
                          ?.regulatingTerminalConnectableId
                    : null
            }
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item container spacing={2}>
                    <Grid item xs={4}>
                        {modification
                            ? ratioTapLoadTapChangingCapabilitiesModificationField
                            : ratioTapLoadTapChangingCapabilitiesField}
                    </Grid>
                    {isRatioTapLoadTapChangingCapabilitiesOn && (
                        <Grid item xs={4}>
                            {regulationModeField}
                        </Grid>
                    )}
                </Grid>
                {isRatioTapLoadTapChangingCapabilitiesOn && (
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
                {isRatioTapLoadTapChangingCapabilitiesOn &&
                    regulationType === REGULATION_TYPES.DISTANT.id && (
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
                {isRatioTapLoadTapChangingCapabilitiesOn &&
                    regulationType === REGULATION_TYPES.LOCAL.id && (
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
                    previousValues={previousValues?.[RATIO_TAP_CHANGER]}
                    modification={modification}
                />
            </Grid>
        </>
    );
};

export default RatioTapChangerPane;
