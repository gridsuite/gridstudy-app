/**
 * Copyright (c) 2024, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import CardContent from '@mui/material/CardContent';
import Card from '@mui/material/Card';
import { Button, CardActions, CardHeader, Theme, Typography } from '@mui/material';
import LineSeparator from '../dialogs/commons/line-separator';
import { FormattedMessage } from 'react-intl';
import BackHandOutlinedIcon from '@mui/icons-material/BackHandOutlined';
import KeyboardReturnOutlinedIcon from '@mui/icons-material/KeyboardReturnOutlined';

const styles = {
    popUpContent: (theme: Theme) => ({
        fontSize: 15,
        fontFamily: theme.typography.fontFamily,
    }),
    symbol: (theme: Theme) => ({
        width: theme.spacing(2),
        height: theme.spacing(2),
    }),
    title: (theme: Theme) => ({
        lineHeight: 1,
        maxWidth: theme.spacing(17.5),
    }),
    card: (theme: Theme) => ({
        position: 'absolute',
        left: theme.spacing(1.25),
        bottom: theme.spacing(10.75),
        maxWidth: theme.spacing(25),
    }),
    header: (theme: Theme) => ({
        paddingBottom: theme.spacing(1.4),
    }),
    actionsContainer: {
        display: 'flex',
        justifyContent: 'center',
    },
};

type GuidancePopupProps = {
    onActionClick: () => void;
};

const GuidancePopup: React.FC<GuidancePopupProps> = ({ onActionClick }) => {
    return (
        <Card sx={styles.card}>
            <CardHeader
                sx={styles.header}
                title={
                    <Typography variant="h6" component="div" sx={styles.title}>
                        <FormattedMessage id={'guidancePopUp.title'} />
                    </Typography>
                }
            />
            <CardContent>
                <Typography variant="body2" sx={styles.popUpContent}>
                    <FormattedMessage
                        id="guidancePopUp.firstVariant"
                        values={{
                            symbol: <BackHandOutlinedIcon sx={styles.symbol} />,
                        }}
                    />
                </Typography>
                <Typography variant="body2" sx={styles.popUpContent}>
                    <FormattedMessage
                        id={'guidancePopUp.secondVariant'}
                        values={{
                            symbol: <KeyboardReturnOutlinedIcon sx={styles.symbol} />,
                        }}
                    />
                </Typography>
            </CardContent>
            <LineSeparator />
            <CardActions sx={styles.actionsContainer}>
                <Button size="small" onClick={onActionClick}>
                    <FormattedMessage id="guidancePopUp.action" />
                </Button>
            </CardActions>
        </Card>
    );
};
export default GuidancePopup;
