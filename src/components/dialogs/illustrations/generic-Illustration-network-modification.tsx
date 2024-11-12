/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Paper from '@mui/material/Paper';
import { LIGHT_THEME } from '@gridsuite/commons-ui';
import { AccordionIllustration } from './AccordionIllustration';
import { PARAM_THEME } from 'utils/config-params';
import { AppState } from 'redux/reducer';

interface ReplacedText {
    eltId: string;
    tradId: string;
}

interface GenericIllustrationNetworkModificationProps {
    svgComponent: React.ComponentType<any>;
    replacedTexts: ReplacedText[];
    backgroundElementId: string;
}
/**
 * This component displays a hide able explanation illustration
 */
const GenericIllustrationNetworkModification: React.FC<GenericIllustrationNetworkModificationProps> = ({
    svgComponent: SvgComponent,
    replacedTexts,
    backgroundElementId,
}) => {
    const [showDiagram, setShowDiagram] = useState(true);
    const intl = useIntl();
    const theme = useSelector((state: AppState) => state[PARAM_THEME]);

    useEffect(() => {
        // dynamically modify the text inside the svg :
        replacedTexts.forEach((replacedText) => {
            const elt = document.getElementById(replacedText.eltId);
            if (!!elt) {
                elt.textContent = intl.formatMessage({
                    id: replacedText.tradId,
                });
            }
        });
    }, [intl, replacedTexts]);

    useEffect(() => {
        /**
         * updates opacity according to the theme by updating the 'style' string from the svg element
         * @param cssProperty : String preceding and describing the property whose opacity must be changed
         * @param svgElt : element fetched from the svg that should be updated
         */
        function updateOpacity(cssProperty: string, svgElt: HTMLElement | null) {
            if (!!svgElt) {
                const eltCssText = svgElt.style.cssText;
                const indexOpacity = eltCssText.indexOf(cssProperty);
                if (indexOpacity !== -1) {
                    svgElt.style.cssText =
                        eltCssText.substring(0, indexOpacity + cssProperty.length) +
                        (theme === LIGHT_THEME ? '0' : '1') +
                        eltCssText.substring(indexOpacity + cssProperty.length + 1);
                } else {
                    svgElt.style.cssText = cssProperty + (theme === LIGHT_THEME ? '0' : '1');
                }
            }
        }
        updateOpacity('fill-opacity: ', document.getElementById(backgroundElementId));
    }, [backgroundElementId, theme]);

    return (
        <AccordionIllustration state={showDiagram} onClick={() => setShowDiagram((showDiagram) => !showDiagram)}>
            <Paper elevation={0} sx={{ backgroundColor: 'transparent' }}>
                <SvgComponent />
            </Paper>
        </AccordionIllustration>
    );
};

export default GenericIllustrationNetworkModification;
