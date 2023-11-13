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

export const styles = {
    illustration: {
        backgroundColor: 'transparent',
        backgroundImage: 'none',
        boxShadow: '0',
        padding: '0px 0px',
    },
};

/**
 * This component displays a hide able explanation illustration
 */
const LineSplitWithVoltageLevelIllustration = () => {
    const [showDiagram, setShowDiagram] = useState(true);
    const intl = useIntl();
    const theme = useSelector((state: ReduxState) => state[PARAM_THEME]);

    useEffect(() => {
        // dynamically modify the text inside the svg :
        const replacedTexts = [
            {
                eltId: 'voltageLevelOrigBeforeTxt',
                tradId: 'VoltageLevel1',
            },
            {
                eltId: 'voltageLevelExtrBeforeTxt',
                tradId: 'VoltageLevel2',
            },
            {
                eltId: 'voltageLevelOrigAfterTxt',
                tradId: 'VoltageLevel1',
            },
            {
                eltId: 'voltageLevelToSplitAtAfterTxt',
                tradId: 'VoltageLevelToSplitAt',
            },
            {
                eltId: 'voltageLevelExtrAfterTxt',
                tradId: 'VoltageLevel2',
            },
            {
                eltId: 'lineToSplitBeforeTxt',
                tradId: 'LineToSplit',
            },
            {
                eltId: 'line1AfterTxt',
                tradId: 'Line1',
            },
            {
                eltId: 'line2AfterTxt',
                tradId: 'Line2',
            },
        ];

        replacedTexts.forEach((replacedText) => {
            const elt = document.getElementById(replacedText.eltId);
            if (elt != null) {
                elt.textContent = intl.formatMessage({
                    id: replacedText.tradId,
                });
            }
        });
    });

    useEffect(() => {
        /**
         * updates opacity according to the theme by updating the 'style' string from the svg element
         * @param propStr : String preceding and describing the property whose opacity must be changed
         * @param svgElt : element fetched from the svg that should be updated
         */
        function updateOpacity(propStr: string, svgElt: HTMLElement | null) {
            if (svgElt != null) {
                const indexOpacity = svgElt.style.cssText.indexOf(propStr);
                if (indexOpacity !== -1) {
                    svgElt.style.cssText =
                        svgElt.style.cssText.substring(
                            0,
                            indexOpacity + propStr.length
                        ) +
                        (theme === 'Light' ? '0' : '1') +
                        svgElt.style.cssText.substring(
                            indexOpacity + propStr.length + 1
                        );
                }
            }
        }
        updateOpacity('fill-opacity: ', document.getElementById('background'));
    }, [theme]);

    return (
        <AccordionIllustration
            state={showDiagram}
            onClick={() => setShowDiagram((showDiagram) => !showDiagram)}
        >
            <Paper sx={styles.illustration}>
                <LineSplitDiagram />
            </Paper>
        </AccordionIllustration>
    );
};

export default LineSplitWithVoltageLevelIllustration;
