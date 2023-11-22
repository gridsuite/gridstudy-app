/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { useIntl } from 'react-intl';
import { AccordionIllustration } from '../widget/AccordionIllustration';
import React, { useEffect, useState } from 'react';
import { ReactComponent as LineSplitDiagram } from '../../../../images/network-modifications/illustrations/line-split-with-voltage-level.svg';
import { useSelector } from 'react-redux';
import { ReduxState } from '../../../../redux/reducer.type';
import { PARAM_THEME } from '../../../../utils/config-params';
import Paper from '@mui/material/Paper';
import { LIGHT_THEME } from '@gridsuite/commons-ui';

export const styles = {
    illustration: {
        backgroundColor: 'transparent',
    },
};

const replacedTexts = [
    {
        eltId: 'line-split-illu-voltage-level1-left-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'line-split-illu-voltage-level2-left-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'line-split-illu-voltage-level1-right-txt',
        tradId: 'VoltageLevel1',
    },
    {
        eltId: 'line-split-illu-voltage-level-to-split-at-right-txt',
        tradId: 'VoltageLevelToSplitAt',
    },
    {
        eltId: 'line-split-illu-voltage-level2-right-txt',
        tradId: 'VoltageLevel2',
    },
    {
        eltId: 'line-split-illu-line-to-split-left-txt',
        tradId: 'LineToSplit',
    },
    {
        eltId: 'line-split-illu-line1-right-txt',
        tradId: 'Line1',
    },
    {
        eltId: 'line-split-illu-line2-right-txt',
        tradId: 'Line2',
    },
];

/**
 * This component displays a hide able explanation illustration
 */
const LineSplitWithVoltageLevelIllustration = () => {
    const [showDiagram, setShowDiagram] = useState(true);
    const intl = useIntl();
    const theme = useSelector((state: ReduxState) => state[PARAM_THEME]);

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
    }, [intl]);

    useEffect(() => {
        /**
         * updates opacity according to the theme by updating the 'style' string from the svg element
         * @param propStr : String preceding and describing the property whose opacity must be changed
         * @param svgElt : element fetched from the svg that should be updated
         */
        function updateOpacity(propStr: string, svgElt: HTMLElement | null) {
            if (!!svgElt) {
                const eltCssText = svgElt.style.cssText;
                const indexOpacity = eltCssText.indexOf(propStr);
                if (indexOpacity !== -1) {
                    svgElt.style.cssText =
                        eltCssText.substring(0, indexOpacity + propStr.length) +
                        (theme === LIGHT_THEME ? '0' : '1') +
                        eltCssText.substring(indexOpacity + propStr.length + 1);
                }
            }
        }
        updateOpacity(
            'fill-opacity: ',
            document.getElementById('line-split-illu-background')
        );
    }, [theme]);

    return (
        <AccordionIllustration
            state={showDiagram}
            onClick={() => setShowDiagram((showDiagram) => !showDiagram)}
        >
            <Paper elevation={0} sx={styles.illustration}>
                <LineSplitDiagram />
            </Paper>
        </AccordionIllustration>
    );
};

export default LineSplitWithVoltageLevelIllustration;
