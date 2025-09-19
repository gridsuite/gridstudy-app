/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { mergeSx, type MuiStyles, type SxStyle } from '@gridsuite/commons-ui';
import Alert from '@mui/material/Alert';
import { FormattedMessage } from 'react-intl';

const styles = {
    customMessageNode: {
        position: 'absolute',
        top: '30%',
        left: '43%',
    },
} as const satisfies MuiStyles;

interface AlertCustomMessageNodeProps {
    message: string;
    noMargin?: boolean;
    style?: SxStyle;
}

const AlertCustomMessageNode = (props: AlertCustomMessageNodeProps) => {
    const { noMargin = false, message, style } = props;

    return (
        <Alert sx={mergeSx(!noMargin ? styles.customMessageNode : undefined, style)} severity="warning">
            <FormattedMessage id={message} />
        </Alert>
    );
};

export default AlertCustomMessageNode;
