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
import { VoltageAdornment } from '../../../../dialog-utils';
import { SwitchInput, FloatInput, SelectInput } from '@gridsuite/commons-ui';
import { RegulatingTerminalForm } from '../../../../regulating-terminal/regulating-terminal-form';
import RatioTapChangerPaneSteps from './ratio-tap-changer-pane-steps';
import { RATIO_REGULATION_MODES, REGULATION_TYPES, SIDE } from 'components/network/constants';
import { EQUIPMENT_TYPES } from 'components/utils/equipment-types';
import CheckboxNullableInput from 'components/utils/rhf-inputs/boolean-nullable-input';
import { getTapChangerEquipmentSectionTypeValue } from 'components/utils/utils';
import { getComputedPreviousRatioRegulationType } from './ratio-tap-changer-pane-utils';
import GridItem from '../../../../commons/grid-item';

const RatioTapChangerPane = ({
    id = RATIO_TAP_CHANGER,
    studyUuid,
    currentNode,
    currentRootNetworkUuid,
    voltageLevelOptions = [],
    previousValues,
    editData,
    isModification = false,
}) => {
    const { trigger } = useFormContext();
    const intl = useIntl();

    const previousRegulation = () => {
        if (previousValues?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES]) {
            return intl.formatMessage({ id: 'On' });
        }
        if (previousValues?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES] === false) {
            return intl.formatMessage({ id: 'Off' });
        }
        return null;
    };

    const getRatioTapChangerRegulationModeLabel = (ratioTapChangerFormValues) => {
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
            previousValues?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES] === true);

    const regulationModeWatch = useWatch({
        name: `${id}.${REGULATION_MODE}`,
    });

    const regulationTypeWatch = useWatch({
        name: `${id}.${REGULATION_TYPE}`,
    });

    const regulationType = useMemo(() => {
        return regulationTypeWatch || getComputedPreviousRatioRegulationType(previousValues);
    }, [previousValues, regulationTypeWatch]);

    // we want to update the validation of these fields when they become optionals to remove the red alert
    useEffect(() => {
        if (regulationModeWatch === RATIO_REGULATION_MODES.FIXED_RATIO.id) {
            trigger(`${id}.${REGULATION_TYPE}`);
            trigger(`${id}.${REGULATION_SIDE}`);
            trigger(`${id}.${TARGET_V}`);
        }
    }, [regulationModeWatch, trigger, id]);

    const ratioTapLoadTapChangingCapabilitiesField = isModification ? (
        <CheckboxNullableInput
            name={`${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`}
            label="OnLoad"
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
            }}
            previousValue={previousRegulation()}
        />
    ) : (
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
            size={'small'}
            disabled={!ratioTapChangerEnabledWatcher}
            previousValue={getRatioTapChangerRegulationModeLabel(previousValues?.[RATIO_TAP_CHANGER])}
        />
    );

    const regulationTypeField = (
        <SelectInput
            name={`${id}.${REGULATION_TYPE}`}
            label={'RegulationTypeText'}
            options={Object.values(REGULATION_TYPES)}
            disabled={!ratioTapChangerEnabledWatcher}
            size={'small'}
            previousValue={getRegulationTypeLabel(previousValues, previousValues?.[RATIO_TAP_CHANGER])}
        />
    );

    const sideField = (
        <SelectInput
            name={`${id}.${REGULATION_SIDE}`}
            label={'RegulatedSide'}
            options={Object.values(SIDE)}
            disabled={!ratioTapChangerEnabledWatcher}
            size={'small'}
            previousValue={getTapSideLabel(previousValues, previousValues?.[RATIO_TAP_CHANGER])}
        />
    );

    const targetVoltage1Field = (
        <FloatInput
            name={`${id}.${TARGET_V}`}
            label="TargetVoltage"
            adornment={VoltageAdornment}
            formProps={{
                disabled: !ratioTapChangerEnabledWatcher,
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
                disabled: !ratioTapChangerEnabledWatcher,
            }}
            previousValue={previousValues?.[RATIO_TAP_CHANGER]?.targetDeadband}
        />
    );

    const regulatingTerminalField = (
        <RegulatingTerminalForm
            id={id}
            disabled={!ratioTapChangerEnabledWatcher}
            equipmentSectionTypeDefaultValue={EQUIPMENT_TYPES.TWO_WINDINGS_TRANSFORMER}
            studyUuid={studyUuid}
            currentNodeUuid={currentNode?.id}
            currentRootNetworkUuid={currentRootNetworkUuid}
            voltageLevelOptions={voltageLevelOptions}
            previousRegulatingTerminalValue={previousValues?.[RATIO_TAP_CHANGER]?.regulatingTerminalVlId}
            previousEquipmentSectionTypeValue={getTapChangerEquipmentSectionTypeValue(
                previousValues?.[RATIO_TAP_CHANGER]
            )}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <Grid item container xs={4}>
                    {ratioTapLoadTapChangingCapabilitiesField}
                </Grid>
                {isRatioTapLoadTapChangingCapabilitiesOn && (
                    <>
                        <Grid item container spacing={2}>
                            <Grid item xs={4}>
                                {regulationModeField}
                            </Grid>

                            <>
                                <Grid item xs={4}>
                                    {targetVoltage1Field}
                                </Grid>
                                <Grid item xs={4}>
                                    {targetDeadbandField}
                                </Grid>
                            </>
                        </Grid>
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
                                <FormattedMessage id="RegulatedTerminal" disabled={true} />
                            </Grid>
                            <Grid item xs={4}>
                                {regulationTypeField}
                            </Grid>
                            {regulationType === REGULATION_TYPES.LOCAL.id && <GridItem size={4}>{sideField}</GridItem>}
                        </Grid>
                        {regulationType === REGULATION_TYPES.DISTANT.id && (
                            <Grid
                                item
                                container
                                columns={3}
                                direction="row"
                                sx={{
                                    justifyContent: 'flex-end',
                                    marginLeft: '10px',
                                }}
                            >
                                <GridItem size={2}>{regulatingTerminalField}</GridItem>
                            </Grid>
                        )}
                    </>
                )}

                <RatioTapChangerPaneSteps
                    disabled={!ratioTapChangerEnabledWatcher}
                    previousValues={previousValues?.[RATIO_TAP_CHANGER]}
                    editData={editData?.[RATIO_TAP_CHANGER]}
                    currentNode={currentNode}
                    isModification={isModification}
                />
            </Grid>
        </>
    );
};

export default RatioTapChangerPane;
