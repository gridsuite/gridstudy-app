/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { useIntl } from 'react-intl';
import { Box, FormHelperText } from '@mui/material';
import React from 'react';

const styles = {
    exponent: {
        position: 'relative',
        bottom: '1ex',
        fontSize: '80%',
    },
};

/**
 * displays a rounding precision like this : 'Rounded to 10^decimalAfterDot' or as a decimal number if decimalAfterDot <= 4
 */
interface DisplayRoundingProps {
    decimalAfterDot: number;
}

export function DisplayRounding({ decimalAfterDot }: Readonly<DisplayRoundingProps>) {
    const intl = useIntl();
    const roundedTo1 = decimalAfterDot === 0;
    const displayAsPower10 = decimalAfterDot > 4;
    const baseMessage =
        intl.formatMessage({
            id: roundedTo1 ? 'filter.roundedToOne' : 'filter.rounded',
        }) + ' ';

    const decimalAfterDotStr = -decimalAfterDot;
    let roundingPrecision = null;
    if (!roundedTo1) {
        roundingPrecision = displayAsPower10 ? (
            <>
                10
                <Box component="span" sx={styles.exponent}>
                    {decimalAfterDotStr}
                </Box>
            </>
        ) : (
            1 / Math.pow(10, decimalAfterDot)
        );
    }
    return (
        <FormHelperText>
            {baseMessage}
            {roundingPrecision}
        </FormHelperText>
    );
}
