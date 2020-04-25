/**
 * Copyright (c) 2020, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Layer, project32, picking} from '@deck.gl/core';
import GL from '@luma.gl/constants';
import {Model, Geometry, Texture2D} from '@luma.gl/core';

import vs from './arrow-layer-vertex.glsl';
import fs from './arrow-layer-fragment.glsl';
import getDistance from "geolib/es/getDistance";

const DEFAULT_COLOR = [0, 0, 0, 255];

const defaultProps = {
    sizeMinPixels: {type: 'number', min: 0, value: 0}, //  min size in pixels
    sizeMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER}, // max size in pixels

    getDistance: {type: 'accessor', value: arrow => arrow.distance},
    getLine: {type: 'accessor', value: arrow => arrow.line},
    getLinePositions: {type: 'accessor', value: line => line.positions},
    getSize: {type: 'accessor', value: 1},
    getColor: {type: 'accessor', value: DEFAULT_COLOR},
    getSpeedFactor: {type: 'accessor', value: 1.0},
    animated: {type: 'boolean', value: true}
};

export default class ArrowLayer extends Layer {

    getShaders(id) {
        return super.getShaders({vs, fs, modules: [project32, picking]});
    }

    initializeState() {
        const {gl} = this.context;

        const maxTextureSize = gl.getParameter(GL.MAX_TEXTURE_SIZE);
        this.state.maxTextureSize = maxTextureSize;

        this.getAttributeManager().addInstanced({
            instanceSize: {
                size: 1,
                transition: true,
                accessor: 'getSize',
                defaultValue: 1
            },
            instanceColor: {
                size: this.props.colorFormat.length,
                transition: true,
                normalized: true,
                type: GL.UNSIGNED_BYTE,
                accessor: 'getColor',
                defaultValue: [0, 0, 0, 255]
            },
            instanceSpeedFactor: {
                size: 1,
                transition: true,
                accessor: 'getSpeedFactor',
                defaultValue: 1.0
            },
            instanceDistance: {
                size: 1,
                transition: true,
                accessor: 'getDistance',
                type: GL.FLOAT,
                defaultValue: 0
            },
            instanceLineDistance: {
                size: 1,
                transition: true,
                type: GL.FLOAT,
                accessor: arrow => {
                    const line = this.props.getLine(arrow);
                    return this.state.lineAttributes.get(line).distance;
                }
            },
            instanceLinePositionsTextureStartIndex: {
                size: 1,
                transition: true,
                type: GL.INT,
                accessor: arrow => {
                    const line = this.props.getLine(arrow);
                    return this.state.lineAttributes.get(line).positionsTextureStartIndex;
                }
            },
            instanceLineDistancesTextureStartIndex: {
                size: 1,
                transition: true,
                type: GL.INT,
                accessor: arrow => {
                    const line = this.props.getLine(arrow);
                    return this.state.lineAttributes.get(line).distancesTextureStartIndex;
                }
            },
            instanceLinePositionCount: {
                size: 1,
                transition: true,
                type: GL.INT,
                accessor: arrow => {
                    const line = this.props.getLine(arrow);
                    return this.state.lineAttributes.get(line).positionCount;
                }
            }
        });
    }

    createTexture2D(gl, data, elementSize, format) {
        const start = performance.now()

        const elementCount = data.length / elementSize;
        const width = Math.min(elementCount, this.state.maxTextureSize);
        const height = Math.ceil(elementCount / this.state.maxTextureSize);

        if (data.length < width * height * elementSize) {
            const oldLength = data.length;
            data.length += (width * height * elementSize - data.length);
            data.fill(0, oldLength, width * height * elementSize);
        }

        const texture2d = new Texture2D(gl, {
            width: width,
            height: height,
            format: format,
            data: new Float32Array(data),
            parameters: {
                [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
                [GL.TEXTURE_MIN_FILTER]: GL.NEAREST
            }
        });

        const stop = performance.now()
        console.info(`Texture of ${elementCount} elements (${width} * ${height}) created in ${stop -start} ms`);

        return texture2d;
    }

    createTexturesStructure(props) {
        const start = performance.now()

        const linePositionsTextureData = [];
        const lineDistancesTextureData = [];
        const lineAttributes = new Map();

        // build line list from arrow list
        const lines = [...new Set(props.data.map(arrow => this.props.getLine(arrow)))];

        lines.forEach(line => {
            const positions = props.getLinePositions(line);
            const linePositionsTextureStartIndex = linePositionsTextureData.length;
            const lineDistancesTextureStartIndex = lineDistancesTextureData.length;
            let linePositionCount = 0;
            let lineDistance = 0;
            let prevPosition;
            positions.forEach((position, index) => {
                // compute distance with previous position
                let segmentDistance = 0;
                if (prevPosition) {
                    segmentDistance = getDistance({ latitude : prevPosition[1], longitude : prevPosition[0]},
                        { latitude : position[1], longitude : position[0]});
                }
                prevPosition = position;

                // fill line positions texture
                linePositionsTextureData.push(position[0]);
                linePositionsTextureData.push(position[1]);

                linePositionCount++;

                // fill line distance texture
                lineDistance += segmentDistance;
                lineDistancesTextureData.push(lineDistance);
            });
            lineAttributes.set(line, {
                distance: lineDistance,
                positionsTextureStartIndex: linePositionsTextureStartIndex,
                distancesTextureStartIndex: lineDistancesTextureStartIndex,
                positionCount: linePositionCount
            });
        });

        const stop = performance.now()
        console.info(`Texture data created in ${stop -start} ms`);

        return {
            linePositionsTextureData,
            lineDistancesTextureData,
            lineAttributes
        }
    }

    updateState({props, oldProps, changeFlags}) {
        super.updateState({props, oldProps, changeFlags});
        if (changeFlags.extensionsChanged) {
            const {gl} = this.context;

            const {
                model
            } = this.state;
            if (model) {
                model.delete();
            }

            const {
                linePositionsTextureData,
                lineDistancesTextureData,
                lineAttributes
            } = this.createTexturesStructure(props);

            const linePositionsTexture = this.createTexture2D(gl, linePositionsTextureData, 2, GL.RG32F);
            const lineDistancesTexture = this.createTexture2D(gl, lineDistancesTextureData, 1, GL.R32F);

            this.setState({
                model: this._getModel(gl),
                linePositionsTexture: linePositionsTexture,
                lineDistancesTexture: lineDistancesTexture,
                lineAttributes: lineAttributes,
                timestamp: 0,
            });

            this.getAttributeManager().invalidateAll();

            if (this.props.animated) {
                this.startAnimation();
            }
        }
    }

    animate(timestamp) {
        if ((timestamp - this.state.timestamp) > 20) { // 20ms => 50pfs
            this.setState({
                timestamp: timestamp,
            });
        }
        window.requestAnimationFrame(timestamp => this.animate(timestamp));
    };

    startAnimation() {
        window.requestAnimationFrame(timestamp => this.animate(timestamp));
    }

    draw({uniforms}) {
        const {viewport} = this.context;

        const {
            sizeMinPixels,
            sizeMaxPixels
        } = this.props;

        const {
            maxTextureSize,
            linePositionsTexture,
            lineDistancesTexture,
            timestamp
        } = this.state;

        this.state.model
            .setUniforms(uniforms)
            .setUniforms({
                sizeMinPixels,
                sizeMaxPixels,
                maxTextureSize,
                linePositionsTexture,
                lineDistancesTexture,
                timestamp
            })
            .draw();
    }

    _getModel(gl) {
        const positions = [-1, -1, 0,
                           0, 1, 0,
                           1, -1, 0];

        return new Model(
            gl,
            Object.assign(this.getShaders(), {
                id: this.props.id,
                geometry: new Geometry({
                    drawMode: GL.TRIANGLE_FAN,
                    vertexCount: 3,
                    attributes: {
                        positions: {size: 3, value: new Float32Array(positions)}
                    }
                }),
                isInstanced: true
            })
        );
    }
}

ArrowLayer.layerName = 'ArrowLayer';
ArrowLayer.defaultProps = defaultProps;
