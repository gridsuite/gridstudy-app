import React, { FunctionComponent } from 'react';
import { Paper, Box } from '@mui/material';
import RootNetworkEditor from './graph/menus/root-network-editor';
import { Theme } from '@mui/material/styles';

type RootNetworkPanelProps = {
    studyId: string;
};

const styles = (theme: Theme) => ({
    paper: {
        position: 'absolute',
        top: 16,
        left: 16,
        width: '320px',
        height: '420px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '8px',
        boxShadow: '0 6px 15px rgba(0,0,0,0.15)', // Softer shadow
        zIndex: 10,
        overflow: 'hidden', // Ensure no overflow
    },
    contentBox: {
        flex: 1, // Take up all available space
        display: 'flex',
        flexDirection: 'column',
        position: 'relative', // Enable absolute positioning for child elements
    },
});

const RootNetworkPanel: FunctionComponent<RootNetworkPanelProps> = ({ studyId }) => {
    return (
        <Paper elevation={3} sx={(theme) => styles(theme).paper}>
            <Box sx={(theme) => styles(theme).contentBox}>
                <RootNetworkEditor />
            </Box>
        </Paper>
    );
};

export default RootNetworkPanel;
