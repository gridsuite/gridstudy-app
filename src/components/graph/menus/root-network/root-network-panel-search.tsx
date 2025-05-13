import React, { SetStateAction, useCallback, useState } from 'react';
import { Box, Typography, TextField, InputAdornment, IconButton, Tabs, Tab, Divider, Theme } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { NetworkNodeIcon, useDebounce } from '@gridsuite/commons-ui';

const styles = {
    root: (theme: Theme) => ({
        margin: theme.spacing(2),
    }),
    rootNameTitle: (theme: Theme) => ({
        fontWeight: 'bold',
    }),
    headerLeftContainer: (theme: Theme) => ({
        marginLeft: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
        flexGrow: 1,
    }),
    uploadButton: (theme: Theme) => ({
        marginLeft: theme.spacing(2),
    }),
};
const results = [
    {
        category: 'N2',
        items: [
            { id: 'XLB149', description: 'Modification de poste' },
            { id: 'XLB149', description: 'Initialisation du plan de tension' },
        ],
    },
    {
        category: 'N2-3-4',
        items: [{ id: 'XLB1TJ', description: 'Suppression de ligne' }],
    },
    {
        category: 'Dopler 10',
        items: [{ id: 'XLB1-85TRB', description: 'Modification de poste' }],
    },
];

interface ModificationsPanelProps {
    setIsSearchActive: React.Dispatch<SetStateAction<boolean>>;
}

const ModificationsPanel: React.FC<ModificationsPanelProps> = ({ setIsSearchActive }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const isSearchActive = searchTerm.trim() !== '';
    const searchMatchingElements = useCallback((newSearchTerm: string) => {
        console.log(newSearchTerm);
    }, []);
    const debouncedHandleChange = useDebounce(searchMatchingElements, 2000);

    const handleManualChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            debouncedHandleChange(e.target.value);
            setSearchTerm(e?.target?.value);
        },
        [debouncedHandleChange, setSearchTerm]
    );
    const handleClear = useCallback(() => {
        setSearchTerm('');
        setIsSearchActive(false);
        //TODO: empty the result
    }, []);

    return (
        <Box sx={styles.root}>
            {/* Tabs */}
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                <Tabs value={0} sx={{ flexGrow: 1 }} indicatorColor="primary">
                    <Tab label="Modifications" />
                </Tabs>
            </Box>

            {/* Search Field */}
            <Box sx={{ mt: 2, display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Chercher un ouvrage..."
                    value={searchTerm}
                    onChange={handleManualChange}
                    size="small"
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
                <IconButton size="small" onClick={handleClear}>
                    <CloseIcon />
                </IconButton>
            </Box>
            {isSearchActive && (
                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                    {results?.length} résultats
                </Typography>
            )}
            {/* Results */}
            <Box sx={{ mt: 2 }}>
                {results.map((group, i) => (
                    <Box key={i} sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <NetworkNodeIcon />
                            <Typography color="textSecondary">{group.category}</Typography>
                        </Box>
                        {group.items.map((item, j) => (
                            <Typography key={j} variant="body2" sx={{ pl: 3 }}>
                                <strong>{item.id}</strong> - {item.description}
                            </Typography>
                        ))}
                        {i < results.length - 1 && <Divider sx={{ mt: 2, bgcolor: 'grey.800' }} />}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default ModificationsPanel;
