import { Grid, Tab, Tabs } from '@mui/material';
import { useIntl } from 'react-intl';
import { TABLES_NAMES } from './config-tables';

export const EquipmentTabs = ({ tabIndex, handleSwitchTab, disabled }) => {
    const intl = useIntl();
    return (
        <Grid container justifyContent={'space-between'} item>
            <Tabs
                value={tabIndex}
                variant="scrollable"
                onChange={(event, value) => {
                    handleSwitchTab(value);
                }}
                aria-label="tables"
            >
                {TABLES_NAMES.map((table) => (
                    <Tab
                        key={table}
                        label={intl.formatMessage({
                            id: table,
                        })}
                        disabled={disabled}
                    />
                ))}
            </Tabs>
        </Grid>
    );
};
