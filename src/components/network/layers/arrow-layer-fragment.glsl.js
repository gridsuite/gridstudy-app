export default `\
#version 300 es
#define SHADER_NAME arrow-layer-fragment-shader

precision highp float;

in vec4 vFillColor;
out vec4 fragmentColor;

void main(void) {
  fragmentColor = vFillColor;
}
`;
