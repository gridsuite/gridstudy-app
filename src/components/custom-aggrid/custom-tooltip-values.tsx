import { Grid, Typography, Tooltip } from '@mui/material';
import { ITooltipParams } from 'ag-grid-community';
import { FunctionComponent } from 'react';

const CustomTooltipValues: FunctionComponent<ITooltipParams> = (props) => {
    const values: string[] = props?.value?.values;
    const valuesComponents = values.map((value, index) => (
        <Typography
            key={index}
            sx={{
                justifyContent: 'start',
                marginRight: '8px',
                marginLeft: '8px',
                fontSize: '12px',
            }}
        >
            {value}
        </Typography>
    ));

    return (
        <>
            <Tooltip title={props?.data?.value?.title}>
                <Grid
                    container
                    item
                    sx={{
                        backgroundColor: 'rgba(91,91,91,255)',
                        color: 'rgba(255, 255, 255, 1)',
                        borderRadius: '3px',
                        display: 'block',
                        flexWrap: 'wrap',
                    }}
                >
                    {valuesComponents}
                </Grid>
            </Tooltip>
        </>
    );
};

export default CustomTooltipValues;
