/**
 * Copyright (c) 2025, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useCallback } from 'react';
import { Diagram, DiagramType } from '../diagram.type';
import { SldSvg, Svg } from '../diagram-common';
import { useLocalizedCountries } from 'components/utils/localized-countries-hook';

export const useDiagramTitle = () => {
    const { translate } = useLocalizedCountries();

    return useCallback(
        (diagram: Diagram, svgData: Svg): string => {
            const getCountrySuffix = (): string => {
                const country = (svgData as SldSvg).additionalMetadata?.country;
                return country ? ` - ${translate(country)}` : '';
            };

            switch (diagram.type) {
                case DiagramType.VOLTAGE_LEVEL:
                    return `${diagram.voltageLevelId}${getCountrySuffix()}`;

                case DiagramType.SUBSTATION:
                    return `${diagram.substationId}${getCountrySuffix()}`;

                case DiagramType.NETWORK_AREA_DIAGRAM:
                    return diagram.voltageLevelIds.join(', ');

                case DiagramType.NAD_FROM_CONFIG:
                    return diagram.nadName;

                default:
                    return 'diagram type unknown';
            }
        },
        [translate]
    );
};
