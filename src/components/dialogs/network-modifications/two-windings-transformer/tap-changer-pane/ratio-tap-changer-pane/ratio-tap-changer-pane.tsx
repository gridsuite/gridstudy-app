/**
 * Copyright (c) 2022, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Grid } from "@mui/material";
import {
    ENABLED,
    LOAD_TAP_CHANGING_CAPABILITIES,
    RATIO_TAP_CHANGER,
    REGULATION_MODE,
    REGULATION_SIDE,
    REGULATION_TYPE,
    TARGET_DEADBAND,
    TARGET_V
} from "components/utils/field-constants";
import { useEffect, useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { VoltageAdornment } from "../../../../dialog-utils";
import { FloatInput, Identifiable, SelectInput, SwitchInput } from "@gridsuite/commons-ui";
import { RegulatingTerminalForm } from "../../../../regulating-terminal/regulating-terminal-form";
import RatioTapChangerPaneSteps from "./ratio-tap-changer-pane-steps";
import { RATIO_REGULATION_MODES, REGULATION_TYPES, SIDE } from "components/network/constants";
import { EQUIPMENT_TYPES } from "components/utils/equipment-types";
import CheckboxNullableInput from "components/utils/rhf-inputs/boolean-nullable-input";
import { getComputedPreviousRatioRegulationType } from "./ratio-tap-changer-pane-utils";
import GridItem from "../../../../commons/grid-item";
import GridSection from "../../../../commons/grid-section";
import useRatioTapChangerTranslations from "./use-ratio-tap-changer-translations";
import {
    NetworkModificationDialogProps
} from "../../../../../graph/menus/network-modifications/network-modification-menu.type";

export type RatioTapChangerPaneProps = NetworkModificationDialogProps & {
  id?: string;
  voltageLevelOptions: Identifiable[];
  previousValues?: any;
  editData?: any;
  isModification?: boolean;
};

export default function RatioTapChangerPane({
                                              id = RATIO_TAP_CHANGER,
                                              studyUuid,
                                              currentNode,
                                              currentRootNetworkUuid,
                                              voltageLevelOptions = [],
                                              previousValues,
                                              editData,
                                              isModification = false
                                            }: Readonly<RatioTapChangerPaneProps>) {
  const { trigger } = useFormContext();
  const { previousRegulation, getRatioTapChangerRegulationModeLabel, getRegulationTypeLabel, getTapSideLabel } =
    useRatioTapChangerTranslations();

  const ratioTapChangerEnabledWatcher = useWatch({
    name: `${id}.${ENABLED}`
  });

  const ratioTapLoadTapChangingCapabilitiesWatcher = useWatch({
    name: `${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`
  });

  const isRatioTapLoadTapChangingCapabilitiesOn =
    ratioTapLoadTapChangingCapabilitiesWatcher ||
    (ratioTapLoadTapChangingCapabilitiesWatcher === null &&
      previousValues?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES] === true);

  const regulationModeWatch = useWatch({
    name: `${id}.${REGULATION_MODE}`
  });

  const regulationTypeWatch = useWatch({
    name: `${id}.${REGULATION_TYPE}`
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
        disabled: !ratioTapChangerEnabledWatcher
      }}
      previousValue={
        previousRegulation(previousValues?.[RATIO_TAP_CHANGER]?.[LOAD_TAP_CHANGING_CAPABILITIES]) ?? undefined
      }
    />
  ) : (
    <SwitchInput
      name={`${id}.${LOAD_TAP_CHANGING_CAPABILITIES}`}
      label="OnLoad"
      formProps={{
        disabled: !ratioTapChangerEnabledWatcher
      }}
    />
  );

  const regulationModeField = (
    <SelectInput
      name={`${id}.${REGULATION_MODE}`}
      label={"RegulationMode"}
      options={Object.values(RATIO_REGULATION_MODES)}
      size={"small"}
      disabled={!ratioTapChangerEnabledWatcher}
      previousValue={getRatioTapChangerRegulationModeLabel(previousValues?.[RATIO_TAP_CHANGER]) ?? undefined}
    />
  );

  const regulationTypeField = (
    <SelectInput
      name={`${id}.${REGULATION_TYPE}`}
      label={"RegulationTypeText"}
      options={Object.values(REGULATION_TYPES)}
      disabled={!ratioTapChangerEnabledWatcher}
      size={"small"}
      previousValue={getRegulationTypeLabel(previousValues, previousValues?.[RATIO_TAP_CHANGER]) ?? undefined}
    />
  );

  const sideField = (
    <SelectInput
      name={`${id}.${REGULATION_SIDE}`}
      label={"RegulatedSide"}
      options={Object.values(SIDE)}
      disabled={!ratioTapChangerEnabledWatcher}
      size={"small"}
      previousValue={getTapSideLabel(previousValues, previousValues?.[RATIO_TAP_CHANGER]) ?? undefined}
    />
  );

  const targetVoltage1Field = (
    <FloatInput
      name={`${id}.${TARGET_V}`}
      label="TargetVoltage"
      adornment={VoltageAdornment}
      formProps={{
        disabled: !ratioTapChangerEnabledWatcher
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
        disabled: !ratioTapChangerEnabledWatcher
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
      regulatingTerminalVlId={previousValues?.regulatingTerminalVlId ?? undefined}
      equipmentSectionType={
        previousValues?.regulatingTerminalConnectableType
          ? previousValues?.regulatingTerminalConnectableType +
          " : " +
          previousValues?.regulatingTerminalConnectableId
          : undefined
      }
    />
  );

  return (
    <>
      <Grid item xs={12}>
        {ratioTapLoadTapChangingCapabilitiesField}
      </Grid>

      {isRatioTapLoadTapChangingCapabilitiesOn && (
        <>
          <GridSection title="RegulatedTerminal" heading={4} />
          <Grid item container xs={12} spacing={1}>
            <GridItem size={4}>{regulationTypeField}</GridItem>

            {regulationType === REGULATION_TYPES.LOCAL.id && (
              <Grid item container xs={12} spacing={1}>
                <GridItem size={4}>{sideField}</GridItem>
              </Grid>
            )}

            {regulationType === REGULATION_TYPES.DISTANT.id && (
              <Grid item container xs={12} spacing={1}>
                <GridItem size={8}>{regulatingTerminalField}</GridItem>
                <GridItem size={4}>{sideField}</GridItem>
              </Grid>
            )}
          </Grid>

          <GridSection title="RegulationSection" heading={4} />
          <Grid item container xs={12} spacing={1}>
            <GridItem size={4}>{regulationModeField}</GridItem>
            <GridItem size={4}>{targetVoltage1Field}</GridItem>
            <GridItem size={4}>{targetDeadbandField}</GridItem>
          </Grid>

        </>
      )}

      <GridSection title="TapsSection" heading={4} />
      <RatioTapChangerPaneSteps
        disabled={!ratioTapChangerEnabledWatcher}
        previousValues={previousValues?.[RATIO_TAP_CHANGER]}
        editData={editData?.[RATIO_TAP_CHANGER]}
        currentNode={currentNode}
        isModification={isModification}
      />
    </>
  );
}
