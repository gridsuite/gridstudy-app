import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        setupNodeEvents(on, config) {
            // implement node event listeners here
        },
    },
    viewportWidth: 1280, // set the desired width
    viewportHeight: 720, // set the desired height
    component: {
        devServer: {
            framework: 'react',
            bundler: 'vite',
        },
    },
});
