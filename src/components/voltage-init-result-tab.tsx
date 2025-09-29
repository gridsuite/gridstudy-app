/*
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useSelector } from 'react-redux';
import { ComputingType } from '@gridsuite/commons-ui';
import RunningStatus from './utils/running-status';
import { voltageInitResultInvalidations } from './computing-status/use-all-computing-status';
import { useNodeData } from './use-node-data';
import { UUID } from 'crypto';
import { AppState } from '../redux/reducer';
import { VoltageInitResult } from './voltage-init-result';
import { useMemo } from 'react';
import { fetchVoltageInitResult } from '../services/study/voltage-init';
import useGlobalFilters from './results/common/global-filter/use-global-filters';
import { useGlobalFilterOptions } from './global-filter/use-global-filter-options';

export type VoltageInitResultTabProps = {
    studyUuid: UUID;
    nodeUuid: UUID;
    currentRootNetworkUuid: UUID;
};

export function VoltageInitResultTab({
    studyUuid,
    nodeUuid,
    currentRootNetworkUuid,
}: Readonly<VoltageInitResultTabProps>) {
    const voltageInitStatus = useSelector(
        (state: AppState) => state.computingStatus[ComputingType.VOLTAGE_INITIALIZATION]
    );
    const { countriesFilter, voltageLevelsFilter, propertiesFilter } = useGlobalFilterOptions();
    const { globalFilters, handleGlobalFilterChange, getGlobalFilterParameter } = useGlobalFilters({});
    const globalFilterOptions = useMemo(
        () => [...voltageLevelsFilter, ...countriesFilter, ...propertiesFilter],
        [voltageLevelsFilter, countriesFilter, propertiesFilter]
    );

    const fetchVoltageInitResultWithGlobalFilters = useMemo(
        () => (studyUuid: UUID, nodeUuid: UUID, currentRootNetworkUuid: UUID) => {
            return fetchVoltageInitResult(studyUuid, nodeUuid, currentRootNetworkUuid, {
                filters: null,
                ...(getGlobalFilterParameter(globalFilters) !== undefined && {
                    globalFilters: {
                        ...getGlobalFilterParameter(globalFilters),
                    },
                }),
            });
        },
        [getGlobalFilterParameter, globalFilters]
    );

    const { result: voltageInitResult } = useNodeData({
        studyUuid,
        nodeUuid,
        rootNetworkUuid: currentRootNetworkUuid,
        fetcher: fetchVoltageInitResultWithGlobalFilters,
        invalidations: voltageInitResultInvalidations,
    });

    const voltageInitResultToShow =
        (voltageInitStatus === RunningStatus.SUCCEED || voltageInitStatus === RunningStatus.FAILED) && voltageInitResult
            ? voltageInitResult
            : null;

    return (
        <VoltageInitResult
            result={voltageInitResultToShow}
            status={voltageInitStatus}
            handleGlobalFilterChange={handleGlobalFilterChange}
            globalFilterOptions={globalFilterOptions}
        />
    );
}
