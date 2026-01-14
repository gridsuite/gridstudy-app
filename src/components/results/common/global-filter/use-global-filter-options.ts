/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { snackWithFallback, useSnackMessage } from '@gridsuite/commons-ui';
import { useEffect, useState } from 'react';
import { GlobalFilter } from './global-filter-types';
import { fetchAllCountries } from '../../../../services/study/network-map';
import { FilterType } from '../utils';
import { fetchSubstationPropertiesGlobalFilters } from './global-filter-utils';
import { useSelector } from 'react-redux';
import { AppState } from '../../../../redux/reducer';
import { useBaseVoltages } from '../../../../hooks/use-base-voltages';

export const useGlobalFilterOptions = () => {
    const studyUuid = useSelector((state: AppState) => state.studyUuid);
    const currentNode = useSelector((state: AppState) => state.currentTreeNode);
    const currentRootNetworkUuid = useSelector((state: AppState) => state.currentRootNetworkUuid);
    const { baseVoltages } = useBaseVoltages();

    const { snackError } = useSnackMessage();

    const [countriesFilter, setCountriesFilter] = useState<GlobalFilter[]>([]);
    const [voltageLevelsFilter, setVoltageLevelsFilter] = useState<GlobalFilter[]>([]);
    // propertiesFilter may be empty or contain several subtypes, depending on the user configuration
    const [propertiesFilter, setPropertiesFilter] = useState<GlobalFilter[]>([]);

    useEffect(() => {
        const newVoltageLevelsFilter = baseVoltages?.map((voltage) => ({
            label: voltage.name,
            minValue: voltage.minValue,
            maxValue: voltage.maxValue,
            filterType: FilterType.VOLTAGE_LEVEL,
        }));
        setVoltageLevelsFilter(newVoltageLevelsFilter ?? []);
    }, [baseVoltages]);

    useEffect(() => {
        if (studyUuid && currentNode?.id && currentRootNetworkUuid) {
            fetchAllCountries(studyUuid, currentNode.id, currentRootNetworkUuid)
                .then((countryCodes) => {
                    setCountriesFilter(
                        countryCodes.map((countryCode: string) => ({
                            label: countryCode,
                            filterType: FilterType.COUNTRY,
                        }))
                    );
                })
                .catch((error) => {
                    snackWithFallback(snackError, error, { headerId: 'FetchCountryError' });
                });

            fetchSubstationPropertiesGlobalFilters().then(({ substationPropertiesGlobalFilters }) => {
                const propertiesGlobalFilters: GlobalFilter[] = [];
                if (substationPropertiesGlobalFilters) {
                    for (let [propertyName, propertyValues] of substationPropertiesGlobalFilters.entries()) {
                        propertyValues.forEach((propertyValue) => {
                            propertiesGlobalFilters.push({
                                label: propertyValue,
                                filterType: FilterType.SUBSTATION_PROPERTY,
                                filterSubtype: propertyName,
                            });
                        });
                    }
                }
                setPropertiesFilter(propertiesGlobalFilters);
            });
        }
    }, [studyUuid, currentRootNetworkUuid, snackError, currentNode?.id]);

    return { countriesFilter, voltageLevelsFilter, propertiesFilter };
};
