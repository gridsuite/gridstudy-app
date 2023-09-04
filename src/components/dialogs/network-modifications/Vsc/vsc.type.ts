/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { EditData } from "../../../../redux/reducer.type";

export interface VscEditData extends EditData {
  dcNominalVoltage : number | null;
  dcResistance: number | null;
  maximumActivePower : number | null;
  operatorActivePowerLimitSide1: number | null;
  operatorActivePowerLimitSide2: number | null;
  convertersMode: string | null;
  activePower: string;
  angleDroopActivePowerControl: boolean;
  p0: number;
  droop: number;
  converterStationId: string;
  converterStationName: string;
  lossFactor: number;
  reactivePower: number;
  voltageRegulationOn: boolean;
  voltage: number
}