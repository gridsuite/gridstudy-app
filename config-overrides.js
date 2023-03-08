/**
 * Copyright (c) 2023, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

const path = require('path');

// same config for angular as https://github.com/plotly/plotly.js/blob/master/BUILDING.md#alternative-ways-to-require-or-build-plotlyjs
module.exports = function override(config) {
    // New config, e.g. config.plugins.push...
    config.module.rules = [...config.module.rules,
        {
            test: /\.js$/,
            include: [
                path.resolve(__dirname, "node_modules/plotly.js")
            ],
            loader: 'ify-loader'
        }
    ]

    return config
}