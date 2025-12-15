/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useCallback, useEffect, useMemo } from 'react';
import { BaseVoltage, BaseVoltageConfig, fetchBaseVoltages } from '@gridsuite/commons-ui';
import { setBaseVoltageList } from '../redux/actions';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../redux/reducer';

export const useBaseVoltages = () => {
    const dispatch = useDispatch();
    const baseVoltages = useSelector((state: AppState) => state.baseVoltages);

    useEffect(() => {
        if (!baseVoltages) {
            fetchBaseVoltages().then((appMetadataBaseVoltages) => {
                console.info('TOTO');
                dispatch(setBaseVoltageList(appMetadataBaseVoltages));
            });
        }
    }, [dispatch, baseVoltages]);

    const baseVoltagesConfig = useMemo((): BaseVoltageConfig[] => {
        if (!baseVoltages) {
            return [];
        }
        return baseVoltages.map(({ name, minValue, maxValue }) => ({ name, minValue, maxValue }));
    }, [baseVoltages]);

    const getBaseVoltage = useCallback(
        (voltageValue: number): BaseVoltage | undefined => {
            for (let interval of baseVoltages) {
                if (voltageValue >= interval.minValue && voltageValue < interval.maxValue) {
                    return interval;
                }
            }
        },
        [baseVoltages]
    );

    return { baseVoltages, getBaseVoltage, baseVoltagesConfig };
};
