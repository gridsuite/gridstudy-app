/*
 * Copyright © 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Alert, Box, Button, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { FormattedMessage } from 'react-intl';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    centeredContent: (theme: any) => ({
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexGrow: 1,
        gap: theme.spacing(2),
    }),
    alertMessage: {
        width: '100%',
        '& .MuiAlert-message': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
        },
        '& .MuiAlert-action': {
            flexShrink: 0,
        },
    },
};

interface PanelErrorBoundaryProps {
    children: ReactNode;
}

interface PanelErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
    copied: boolean;
}

export default class PanelErrorBoundary extends Component<PanelErrorBoundaryProps, PanelErrorBoundaryState> {
    constructor(props: PanelErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null, copied: false };
    }

    static getDerivedStateFromError(error: Error): PanelErrorBoundaryState {
        return { hasError: true, error, errorInfo: null, copied: false };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Panel error caught:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null, copied: false });
    };

    getErrorText = (): string => {
        if (!this.state.error) return '';

        let errorText = `Error: ${this.state.error.toString()}`;
        if (this.state.errorInfo?.componentStack) {
            errorText += `\nComponent Stack: ${this.state.errorInfo.componentStack}`;
        }
        if (this.state.error.stack) {
            errorText += `\nStack Trace: ${this.state.error.stack}`;
        }
        return errorText;
    };

    handleCopy = async () => {
        const errorText = this.getErrorText();
        if (errorText) {
            await navigator.clipboard.writeText(errorText);
            this.setState({ copied: true });
            setTimeout(() => this.setState({ copied: false }), 2000);
        }
    };

    render() {
        if (this.state.hasError) {
            return (
                <Box sx={styles.container}>
                    <Box sx={styles.centeredContent}>
                        <ErrorOutlineIcon fontSize="large" color="error" />
                        <Typography>
                            <FormattedMessage id="PanelError" />
                        </Typography>
                        <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={this.handleReset}>
                            <FormattedMessage id="Reload" />
                        </Button>
                    </Box>
                    {this.state.error && (
                        <Alert
                            severity="warning"
                            sx={styles.alertMessage}
                            action={
                                <Button
                                    color="inherit"
                                    size="small"
                                    startIcon={<ContentCopyIcon />}
                                    onClick={this.handleCopy}
                                >
                                    <FormattedMessage id={this.state.copied ? 'Copied' : 'CopyError'} />
                                </Button>
                            }
                        >
                            {this.state.error.toString()}
                        </Alert>
                    )}
                </Box>
            );
        }

        return this.props.children;
    }
}
