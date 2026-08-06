/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {
    snackWithFallback,
    useSnackMessage,
    GlobalFilterType,
    addGlobalFilterId,
    GlobalFilterWithoutId,
} from '@gridsuite/commons-ui';
import { useEffect } from 'react';
import { fetchAllCountries } from '../../../../../services/study/network-map';
import { fetchSubstationPropertiesGlobalFilters } from '../adapter/global-filter-app-data';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from '../../../../../redux/reducer.type';
import { useBaseVoltages } from '../../../../../hooks/use-base-voltages';
import { addToGlobalFilterOptions } from '../../../../../redux/actions';
import { fetchNetworkExistence } from '../../../../services/study/network';
import { HttpStatusCode } from '../../../../utils/http-status-code';

/**
 * Custom hook that manages global filter options for tables.
 *
 * This hook fetches and manages several types of filters:
 * 1. Voltage levels filters - derived from base voltages
 * 2. Country filters - fetched from network map service
 * 3. Substation property filters - fetched from substation properties
 *
 * The hook automatically updates the associated global filter options in the Redux store when the underlying data changes.
 */
export const useGlobalFilterOptions = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const { baseVoltages } = useBaseVoltages();
    const dispatch = useDispatch();

    const { snackError } = useSnackMessage();

    useEffect(() => {
        const newVoltageLevelsFilter =
            baseVoltages
                ?.map((voltage) => ({
                    label: voltage.name,
                    minValue: voltage.minValue,
                    maxValue: voltage.maxValue,
                    filterType: GlobalFilterType.VOLTAGE_LEVEL,
                }))
                .map(addGlobalFilterId) ?? [];
        dispatch(addToGlobalFilterOptions(newVoltageLevelsFilter));
    }, [baseVoltages, dispatch]);

    useEffect(() => {
        const run = async () => {
            if (!studyUuid || !currentNode?.id || !currentRootNetworkUuid) return;

            const response = await fetchNetworkExistence(studyUuid, currentRootNetworkUuid);

            if (response.status === HttpStatusCode.OK) {
                try {
                    const countryCodes = await fetchAllCountries(studyUuid, currentNode.id, currentRootNetworkUuid);

                    const newCountriesFilter = countryCodes
                        .map((countryCode: string) => ({
                            label: countryCode,
                            filterType: GlobalFilterType.COUNTRY,
                        }))
                        .map(addGlobalFilterId);

                    dispatch(addToGlobalFilterOptions(newCountriesFilter));
                } catch (error) {
                    snackWithFallback(snackError, error, { headerId: 'FetchCountryError' });
                }
            }

            fetchSubstationPropertiesGlobalFilters().then(({ substationPropertiesGlobalFilters }) => {
                const propertiesGlobalFilters: GlobalFilterWithoutId[] = [];
                if (substationPropertiesGlobalFilters) {
                    for (let [propertyName, propertyValues] of substationPropertiesGlobalFilters.entries()) {
                        propertyValues.forEach((propertyValue) => {
                            propertiesGlobalFilters.push({
                                label: propertyValue,
                                filterType: GlobalFilterType.SUBSTATION_PROPERTY,
                                filterSubtype: propertyName,
                            });
                        });
                    }
                }
                // propertiesFilter may be empty or contain several subtypes, depending on the user configuration
                dispatch(addToGlobalFilterOptions(propertiesGlobalFilters.map(addGlobalFilterId)));
            });
        }
    }, [studyUuid, currentRootNetworkUuid, snackError, currentNode?.id, dispatch]);
};
