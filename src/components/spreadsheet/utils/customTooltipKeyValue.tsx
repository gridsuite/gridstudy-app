import { Grid, Typography, Tooltip } from '@mui/material';
import { ITooltipParams } from 'ag-grid-community';
import { FunctionComponent } from 'react';

const CustomTooltipKeyValue: FunctionComponent<ITooltipParams> = (props) => {
    const value = props?.value;
    let properties = value?.properties;
    let keys: string[] = [];
    if (properties) {
        keys = Object.keys(properties);
    }
    return keys.length > 2 ? (
        <Tooltip title={value.title}>
            <Grid
                container
                item
                xs={6}
                sx={{
                    backgroundColor: 'rgba(91,91,91,255)',
                    color: 'rgba(255, 255, 255, 1)',
                    borderRadius: '3px',
                    display: 'flex',
                    flexWrap: 'wrap',
                }}
            >
                {keys.map((key) => {
                    return (
                        <Grid
                            container
                            key={key}
                            spacing={1}
                            sx={{
                                justifyContent: 'start',
                                marginLeft: '2px',
                            }}
                        >
                            <Grid item>
                                <Typography>{key}:</Typography>
                            </Grid>
                            <Grid item>
                                <Typography>{properties[key]}</Typography>
                            </Grid>
                        </Grid>
                    );
                })}
            </Grid>
        </Tooltip>
    ) : null;
};

export default CustomTooltipKeyValue;
