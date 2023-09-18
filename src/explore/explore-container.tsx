import { FunctionComponent } from 'react';
import Grid from '@mui/material/Grid';
import TreeViewsContainer from './components/tree-views-container';
import DirectoryBreadcrumbs from './components/directory-breadcrumbs';
import DirectoryContent from './components/directory-content';

export const ExploreContainer: FunctionComponent = () => {
    return (
        <Grid
            container
            style={{ height: '100%' }}
        >
            <Grid
                item
                xs={12}
                sm={3}
                style={{
                    borderRight:
                        '1px solid rgba(81, 81, 81, 1)',
                    height: '100%',
                    overflow: 'auto',
                    display: 'flex',
                }}
            >
                <TreeViewsContainer />
            </Grid>
            <Grid item xs={12} sm={9}>
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        height: '100%',
                    }}
                >
                    <DirectoryBreadcrumbs />
                    <DirectoryContent />
                </div>
            </Grid>
        </Grid>
    );
};
