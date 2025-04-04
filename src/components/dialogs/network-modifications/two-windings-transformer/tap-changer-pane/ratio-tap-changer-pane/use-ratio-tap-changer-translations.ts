/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from "react";
import { useIntl } from "react-intl";
import {
  getPreviousRegulationKey,
  getRatioTapChangerRegulationModeKey,
  getRegulationTypeKey,
  getTapSideKey
} from "./ratio-tap-changer-pane-utils";

export default function useRatioTapChangerTranslations() {
  const intl = useIntl();

  const previousRegulation = useCallback(
    (ratioTapChanger: any) => {
      const key = getPreviousRegulationKey(ratioTapChanger);
      return key ? intl.formatMessage({ id: key }) : null;
    },
    [intl]
  );

  const getRatioTapChangerRegulationModeLabel = useCallback(
    (ratioTapChangerFormValues: any) => {
      const key = getRatioTapChangerRegulationModeKey(ratioTapChangerFormValues);
      return key ? intl.formatMessage({ id: key }) : null;
    },
    [intl]
  );

  const getRegulationTypeLabel = useCallback(
    (twt: any, tap: any) => {
      const key = getRegulationTypeKey(twt, tap);
      return key ? intl.formatMessage({ id: key }) : null;
    },
    [intl]
  );

  const getTapSideLabel = useCallback(
    (twt: any, tap: any) => {
      const key = getTapSideKey(twt, tap);
      return key ? intl.formatMessage({ id: key }) : null;
    },
    [intl]
  );

  return {
    previousRegulation,
    getRatioTapChangerRegulationModeLabel,
    getRegulationTypeLabel,
    getTapSideLabel
  };
}
