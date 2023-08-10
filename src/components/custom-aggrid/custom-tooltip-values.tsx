import { Grid, Typography, Tooltip } from '@mui/material';
import { ITooltipParams } from 'ag-grid-community';
import { FunctionComponent } from 'react';

const CustomTooltipValues: FunctionComponent<ITooltipParams> = (props) => {
    const values: string[] = props?.value?.values;
    return (
        <>
            {values && values.length && (
                <Tooltip title={props?.data?.value?.title}>
                    <Grid
                        container
                        item
                        sx={{
                            backgroundColor: 'rgba(91,91,91,255)',
                            color: 'rgba(255, 255, 255, 1)',
                            borderRadius: '3px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            maxWidth: '200px',
                        }}
                    >
                        <Typography
                            sx={{
                                justifyContent: 'start',
                                margin: '5px',
                            }}
                        >
                            {values}
                        </Typography>
                    </Grid>
                </Tooltip>
            )}
        </>
    );
};

export default CustomTooltipValues;
