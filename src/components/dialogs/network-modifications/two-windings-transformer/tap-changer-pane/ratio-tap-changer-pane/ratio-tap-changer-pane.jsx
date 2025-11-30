/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from '@mui/material';
import {
    ENABLED,
    EQUIPMENT,
    LOAD_TAP_CHANGING_CAPABILITIES,
    RATIO_TAP_CHANGER,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    TARGET_DEADBAND,
    TARGET_V,
    VOLTAGE_LEVEL,
} from 'components/utils/field-constants';
import { useCallback, useEffect, useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { useIntl } from 'react-intl';
import { VoltageAdornment } from '../../../../dialog-utils';
import { FloatInput, SelectInput, SwitchInput } from '@gridsuite/commons-ui';
import RatioTapChangerPaneSteps from './ratio-tap-changer-pane-steps';
import { RATIO_REGULATION_MODES } from 'components/network/constants';
import CheckboxNullableInput from 'components/utils/rhf-inputs/boolean-nullable-input';
import {
    getComputedPreviousRatioRegulationType,
    getComputedRegulationModeId,
    getComputedRegulationTypeId,
    getComputedTapSideId,
} from './ratio-tap-changer-pane-utils';
import GridItem from '../../../../commons/grid-item';
import GridSection from '../../../../commons/grid-section';
import RegulatedTerminalSection from '../regulated-terminal-section';

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
    const { trigger, setValue, getValues } = useFormContext();
    const intl = useIntl();

    const previousRegulation = () => {
        if (previousValues?.ratioTapChanger?.hasLoadTapChangingCapabilities) {
            return intl.formatMessage({ id: 'On' });
        }
        if (previousValues?.ratioTapChanger?.hasLoadTapChangingCapabilities === false) {
            return intl.formatMessage({ id: 'Off' });
        }
        return null;
    };

    const getRatioTapChangerRegulationModeLabel = (ratioTapChangerFormValues) => {
        if (!ratioTapChangerFormValues) {
            return null;
        }
        if (ratioTapChangerFormValues?.isRegulating) {
            return intl.formatMessage({
                id: RATIO_REGULATION_MODES.VOLTAGE_REGULATION.label,
            });
        } else {
            return intl.formatMessage({
                id: RATIO_REGULATION_MODES.FIXED_RATIO.label,
            });
        }
    };

    const ratioTapChangerEnabledWatcher = useWatch({
        name: `${id}.${ENABLED}`,
    });

    const ratioTapLoadTapChangingCapabilitiesWatcher = useWatch({
        name: `${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`,
    });

    const isRatioTapLoadTapChangingCapabilitiesOff =
        !ratioTapLoadTapChangingCapabilitiesWatcher || ratioTapLoadTapChangingCapabilitiesWatcher === null;

    const regulationModeWatch = useWatch({
        name: `${id}.${REGULATION_MODE}`,
    });

    const regulationTypeWatch = useWatch({
        name: `${id}.${REGULATION_TYPE}`,
    });

    const regulationType = useMemo(() => {
        return regulationTypeWatch || getComputedPreviousRatioRegulationType(previousValues);
    }, [previousValues, regulationTypeWatch]);

    const findAndSetVoltageLevelFromPrevious = useCallback(
        (previousValues, voltageLevelOptions) => {
            const prevVl = voltageLevelOptions.find(
                (vl) => vl.id === previousValues?.ratioTapChanger?.regulatingTerminalVlId
            );
            if (prevVl) {
                const newVlValue = {
                    id: prevVl.id,
                    label: prevVl.name ?? '',
                };
                setValue(`${id}.${VOLTAGE_LEVEL}`, newVlValue);
            } else {
                // not supposed to happen, but if it does, we want to log it and keep the form as it is
                console.error('Voltage level not found:', prevVl);
            }
        },
        [setValue, id]
    );

    const setEquipmentFromPrevious = useCallback(
        (previousValues) => {
            const prevEquipmentId = previousValues?.ratioTapChanger?.regulatingTerminalConnectableId;
            if (prevEquipmentId) {
                const prevEquipmentType = previousValues?.ratioTapChanger?.regulatingTerminalConnectableType;
                const newEquipment = {
                    id: prevEquipmentId,
                    label: prevEquipmentType,
                    type: prevEquipmentType,
                };
                setValue(`${id}.${EQUIPMENT}`, newEquipment);
            }
        },
        [setValue, id]
    );

    // we want to fill the empty fields with the previous values when 'on load' is enabled
    const fillRatioTapChangerRegulationAttributesWithPreviousValues = useCallback(
        (newOnLoad) => {
            if (newOnLoad === true) {
                const curRatioTapChanger = getValues(id);

                if (curRatioTapChanger[REGULATION_MODE] === null) {
                    setValue(`${id}.${REGULATION_MODE}`, getComputedRegulationModeId(previousValues));
                }
                if (curRatioTapChanger[TARGET_V] === null) {
                    setValue(`${id}.${TARGET_V}`, previousValues?.ratioTapChanger?.targetV);
                }
                if (curRatioTapChanger[TARGET_DEADBAND] === null) {
                    setValue(`${id}.${TARGET_DEADBAND}`, previousValues?.ratioTapChanger?.targetDeadband);
                }
                if (curRatioTapChanger[REGULATION_TYPE] === null) {
                    setValue(`${id}.${REGULATION_TYPE}`, getComputedRegulationTypeId(previousValues));
                }
                if (curRatioTapChanger[REGULATION_SIDE] === null) {
                    setValue(`${id}.${REGULATION_SIDE}`, getComputedTapSideId(previousValues));
                }
                if (curRatioTapChanger[VOLTAGE_LEVEL] === null) {
                    findAndSetVoltageLevelFromPrevious(previousValues, voltageLevelOptions);
                }
                if (curRatioTapChanger[EQUIPMENT] === null) {
                    setEquipmentFromPrevious(previousValues);
                }
            }
        },
        [
            id,
            voltageLevelOptions,
            previousValues,
            setValue,
            getValues,
            findAndSetVoltageLevelFromPrevious,
            setEquipmentFromPrevious,
        ]
    );

    // we want to update the validation of these fields when they become optionals to remove the red alert
    useEffect(() => {
        if (regulationModeWatch === RATIO_REGULATION_MODES.FIXED_RATIO.id) {
            trigger(`${id}.${REGULATION_TYPE}`).then();
            trigger(`${id}.${REGULATION_SIDE}`).then();
            trigger(`${id}.${TARGET_V}`).then();
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
            onChange={fillRatioTapChangerRegulationAttributesWithPreviousValues}
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
            size="small"
            disabled={isRatioTapLoadTapChangingCapabilitiesOff}
            previousValue={getRatioTapChangerRegulationModeLabel(previousValues?.ratioTapChanger)}
        />
    );

    const targetVoltage1Field = (
        <FloatInput
            name={`${id}.${TARGET_V}`}
            label="TargetVoltage"
            adornment={VoltageAdornment}
            formProps={{
                disabled: isRatioTapLoadTapChangingCapabilitiesOff,
            }}
            previousValue={previousValues?.ratioTapChanger?.targetV}
        />
    );

    const targetDeadbandField = (
        <FloatInput
            name={`${id}.${TARGET_DEADBAND}`}
            label="Deadband"
            adornment={VoltageAdornment}
            formProps={{
                disabled: isRatioTapLoadTapChangingCapabilitiesOff,
            }}
            previousValue={previousValues?.ratioTapChanger?.targetDeadband}
        />
    );

    return (
        <>
            <Grid container spacing={2}>
                <GridItem size={3}>{ratioTapLoadTapChangingCapabilitiesField}</GridItem>
                <GridItem size={'auto'}></GridItem>
            </Grid>
            <GridSection title="RegulationSection" heading={4} />
            <Grid item container spacing={1}>
                <GridItem size={4}>{regulationModeField}</GridItem>
                <GridItem size={4}>{targetVoltage1Field}</GridItem>
                <GridItem size={4}>{targetDeadbandField}</GridItem>
            </Grid>
            <RegulatedTerminalSection
                id={id}
                studyUuid={studyUuid}
                currentNode={currentNode}
                currentRootNetworkUuid={currentRootNetworkUuid}
                voltageLevelOptions={voltageLevelOptions}
                previousValues={previousValues}
                tapChangerDisabled={isRatioTapLoadTapChangingCapabilitiesOff}
                regulationType={regulationType}
            />

            <GridSection title="TapsSection" heading={4} />
            <RatioTapChangerPaneSteps
                disabled={!ratioTapChangerEnabledWatcher}
                previousValues={previousValues?.ratioTapChanger}
                editData={editData?.ratioTapChanger}
                currentNode={currentNode}
                isModification={isModification}
            />
        </>
    );
};

export default RatioTapChangerPane;
