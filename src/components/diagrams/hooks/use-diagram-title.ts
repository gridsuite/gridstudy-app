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

    const getDiagramTitle = useCallback(
        (diagram: Diagram, svgData: Svg): string => {
            if (diagram.type === DiagramType.VOLTAGE_LEVEL) {
                let diagramName = `${diagram.voltageLevelId}`;
                const country = (svgData as SldSvg).additionalMetadata?.country;
                if (country) {
                    diagramName += ` - ${translate(country)}`;
                }
                return diagramName;
            } else if (diagram.type === DiagramType.SUBSTATION) {
                let diagramName = `${diagram.substationId}`;
                const country = (svgData as SldSvg).additionalMetadata?.country;
                if (country) {
                    diagramName += ` - ${translate(country)}`;
                }
                return diagramName;
            } else if (diagram.type === DiagramType.NETWORK_AREA_DIAGRAM) {
                return `${diagram.voltageLevelIds.join(', ')}`;
            } else if (diagram.type === DiagramType.NAD_FROM_CONFIG) {
                return `${diagram.nadName}`;
            }
            return `diagram type unknown`;
        },
        [translate]
    );
    return getDiagramTitle;
};
