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
import cheapRuler from 'cheap-ruler';

const DEFAULT_COLOR = [0, 0, 0, 255];

// this value has to be consistent with the one in vertex shader
const MAX_LINE_POINT_COUNT = 2 ** 15;

export const ArrowDirection = {
    NONE: 'none',
    FROM_SIDE_1_TO_SIDE_2: 'fromSide1ToSide2',
    FROM_SIDE_2_TO_SIDE_1: 'fromSide2ToSide1'
};

const defaultProps = {
    sizeMinPixels: {type: 'number', min: 0, value: 0}, //  min size in pixels
    sizeMaxPixels: {type: 'number', min: 0, value: Number.MAX_SAFE_INTEGER}, // max size in pixels

    getDistance: {type: 'accessor', value: arrow => arrow.distance},
    getLine: {type: 'accessor', value: arrow => arrow.line},
    getLinePositions: {type: 'accessor', value: line => line.positions},
    getSize: {type: 'accessor', value: 1},
    getColor: {type: 'accessor', value: DEFAULT_COLOR},
    getSpeedFactor: {type: 'accessor', value: 1.0},
    getDirection: {type: 'accessor', value: ArrowDirection.NONE},
    animated: {type: 'boolean', value: true}
};

export default class ArrowLayer extends Layer {

    getShaders(id) {
        return super.getShaders({vs, fs, modules: [project32, picking]});
    }

    getArrowLineAttributes(arrow) {
        const line = this.props.getLine(arrow);
        if (!line) {
            throw new Error("Invalid line");
        }
        const attributes = this.state.lineAttributes.get(line);
        if (!attributes) {
            throw new Error(`Line ${line.id} not found`);
        }
        return attributes;
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
            instanceArrowDistance: {
                size: 1,
                transition: true,
                accessor: 'getDistance',
                type: GL.FLOAT,
                defaultValue: 0
            },
            instanceArrowDirection: {
                size: 1,
                transition: true,
                accessor: 'getDirection',
                transform: direction => {
                    switch (direction) {
                        case ArrowDirection.NONE:
                            return 0.0;
                        case ArrowDirection.FROM_SIDE_1_TO_SIDE_2:
                            return 1.0;
                        case ArrowDirection.FROM_SIDE_2_TO_SIDE_1:
                            return 2.0;
                    }
                },
                defaultValue: 0.0
            },
            instanceLineDistance: {
                size: 1,
                transition: true,
                type: GL.FLOAT,
                accessor: arrow => this.getArrowLineAttributes(arrow).distance
            },
            instanceLinePositionsTextureOffset: {
                size: 1,
                transition: true,
                type: GL.FLOAT,
                accessor: arrow => this.getArrowLineAttributes(arrow).positionsTextureOffset
            },
            instanceLineDistancesTextureOffset: {
                size: 1,
                transition: true,
                type: GL.FLOAT,
                accessor: arrow => this.getArrowLineAttributes(arrow).distancesTextureOffset
            },
            instanceLinePointCount: {
                size: 1,
                transition: true,
                type: GL.FLOAT,
                accessor: arrow => this.getArrowLineAttributes(arrow).pointCount
            }
        });
    }

    finalizeState() {
        super.finalizeState();
        // we do not use setState to avoid a redraw, it is just used to stop the animation
        this.state.stop = true;
    }

    createTexture2D(gl, data, format) {
        const start = performance.now()

        // we calculate the smallest square texture that is a power of 2 but less or equals to MAX_TEXTURE_SIZE
        // (which is an property of the graphic card)
        const n = Math.ceil(Math.log2(data.length) / 2);
        const textureSize = 2 ** n;
        const { maxTextureSize } = this.state;
        if (textureSize > maxTextureSize) {
            throw new Error(`Texture size (${textureSize}) cannot be greater than ${maxTextureSize}`);
        }

        // data length needs to be width * height (otherwise we get an error), so we pad the data array with zero until
        // reaching the correct size.
        if (data.length < textureSize * textureSize) {
            const oldLength = data.length;
            data.length = textureSize * textureSize;
            data.fill(0, oldLength, textureSize * textureSize);
        }

        const texture2d = new Texture2D(gl, {
            width: textureSize,
            height: textureSize,
            format: format,
            data: new Float32Array(data),
            parameters: {
                [GL.TEXTURE_MAG_FILTER]: GL.NEAREST,
                [GL.TEXTURE_MIN_FILTER]: GL.NEAREST,
                [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
                [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
            },
            mipmaps: false
        });

        const stop = performance.now()
        console.info(`Texture ${textureSize} * ${textureSize} created in ${stop -start} ms`);

        return texture2d;
    }

    createTexturesStructure(props) {
        const start = performance.now()

        const lineLongitudesTextureData = [];
        const lineLatitudesTextureData = [];
        const lineDistancesTextureData = [];
        const lineAttributes = new Map();

        // build line list from arrow list
        const lines = [...new Set(props.data.map(arrow => this.props.getLine(arrow)))];

        lines.forEach(line => {
            const positions = props.getLinePositions(line);
            if (!positions) {
                throw new Error(`Invalid positions for line ${line.id}`);
            }
            const linePositionsTextureOffset = lineLongitudesTextureData.length;
            const lineDistancesTextureOffset = lineDistancesTextureData.length;
            let linePointCount = 0;
            let lineDistance = 0;
            if (positions.length > 0) {
                let ruler = cheapRuler(positions[0][1], 'meters');
                let prevPosition;
                positions.forEach((position, index) => {
                    // compute distance with previous position
                    let segmentDistance = 0;
                    if (prevPosition) {
                        ruler = cheapRuler(position[1], 'meters');
                        segmentDistance = ruler.distance([prevPosition[1], prevPosition[0]],
                                                         [position[1], position[0]]);
                    }
                    prevPosition = position;

                    // fill line positions texture
                    lineLongitudesTextureData.push(position[0]);
                    lineLatitudesTextureData.push(position[1]);

                    linePointCount++;

                    // fill line distance texture
                    lineDistance += segmentDistance;
                    lineDistancesTextureData.push(lineDistance);
                });
            }
            if (linePointCount > MAX_LINE_POINT_COUNT) {
                throw new Error(`Too many line point count (${linePointCount}), maximum is ${MAX_LINE_POINT_COUNT}`);
            }
            lineAttributes.set(line, {
                distance: lineDistance,
                positionsTextureOffset: linePositionsTextureOffset,
                distancesTextureOffset: lineDistancesTextureOffset,
                pointCount: linePointCount
            });
        });

        const stop = performance.now()
        console.info(`Texture data created in ${stop -start} ms`);

        return {
            lineLongitudesTextureData,
            lineLatitudesTextureData,
            lineDistancesTextureData,
            lineAttributes
        }
    }

    updateGeometry({props, changeFlags}) {
        const geometryChanged =
            changeFlags.dataChanged ||
            (changeFlags.updateTriggersChanged &&
                (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged.getLinePositions));

        if (geometryChanged) {
            const {gl} = this.context;

            const {
                lineLongitudesTextureData,
                lineLatitudesTextureData,
                lineDistancesTextureData,
                lineAttributes
            } = this.createTexturesStructure(props);

            const lineLongitudesTexture = this.createTexture2D(gl, lineLongitudesTextureData, GL.R32F);
            const lineLatitudesTexture = this.createTexture2D(gl, lineLatitudesTextureData, GL.R32F);
            const lineDistancesTexture = this.createTexture2D(gl, lineDistancesTextureData, GL.R32F);

            this.setState({
                lineLongitudesTexture,
                lineLatitudesTexture,
                lineDistancesTexture,
                lineAttributes,
                timestamp: 0
            });

            if (!changeFlags.dataChanged) {
                this.getAttributeManager().invalidateAll();
            }
        }
    }

    updateModel({changeFlags}) {
        if (changeFlags.extensionsChanged) {
            const {gl} = this.context;

            const {
                model
            } = this.state;
            if (model) {
                model.delete();
            }

            this.setState({
                model: this._getModel(gl)
            });

            this.getAttributeManager().invalidateAll();
        }
    }

    updateState(updateParams) {
        super.updateState(updateParams);

        this.updateGeometry(updateParams);
        this.updateModel(updateParams);

        const {props, oldProps} = updateParams;

        if (props.animated !== oldProps.animated) {
            this.setState({
                stop: !props.animated
            });
            if (props.animated) {
                this.startAnimation();
            }
        }
    }

    animate(timestamp) {
        if (this.state.stop) {
            return;
        }
        this.setState({
            timestamp: timestamp,
        });
        this.startAnimation();
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
            lineLongitudesTexture,
            lineLatitudesTexture,
            lineDistancesTexture,
            timestamp
        } = this.state;

        this.state.model
            .setUniforms(uniforms)
            .setUniforms({
                sizeMinPixels,
                sizeMaxPixels,
                lineLongitudesTexture,
                lineLatitudesTexture,
                lineDistancesTexture,
                linePositionsTextureSize: [lineLongitudesTexture.width, lineLongitudesTexture.height],
                lineDistancesTextureSize: [lineDistancesTexture.width, lineDistancesTexture.height],
                timestamp
            })
            .draw();
    }

    _getModel(gl) {
        const positions = [-1, -1,  0,
                           0,  1,   0,
                           0,  -0.6, 0,
                           1,  -1,  0,
                           0,  1,   0,
                           0,  -0.6, 0];

        return new Model(
            gl,
            Object.assign(this.getShaders(), {
                id: this.props.id,
                geometry: new Geometry({
                    drawMode: GL.TRIANGLES,
                    vertexCount: 6,
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
