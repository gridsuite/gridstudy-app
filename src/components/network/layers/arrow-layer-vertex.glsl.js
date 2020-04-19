export default `\
#version 300 es
#define SHADER_NAME arrow-layer-vertex-shader

in vec3 positions;

in float instanceSize;
in float instanceDistance;
in vec4 instanceColor;
in float instanceSpeedFactor;
in int instanceLinePositionsTextureStartIndex;
in int instanceLineDistancesTextureStartIndex;
in int instanceLinePositionCount;
in float instanceLineDistance;

uniform float sizeMinPixels;
uniform float sizeMaxPixels;
uniform float timestamp;
uniform sampler2D linePositionsTexture;
uniform sampler2D lineDistancesTexture;
uniform int maxTextureSize;

out vec4 vFillColor;

ivec2 position(int i) {
  int x = int(mod(float(i), float(maxTextureSize)));
  int y = int(trunc(float(i) / float(maxTextureSize)));
  return ivec2(x, y);
}

vec3 fetchLinePosition(int positionNumber) {
  int i = instanceLinePositionsTextureStartIndex + positionNumber;
  return vec3(texelFetch(linePositionsTexture, position(i), 0).xy, 0);
}

float fetchLineDistance(int positionNumber) {
  int i = instanceLineDistancesTextureStartIndex + positionNumber;
  return texelFetch(lineDistancesTexture, position(i), 0).x;
}

void main(void) {
  // arrow distance from the line start
  float arrowDistance = mod(instanceLineDistance * instanceDistance + timestamp * instanceSpeedFactor, instanceLineDistance);

  // look for first line position index that is further arrow distance
  int positionNumber;
  for (int i = 1; i < instanceLinePositionCount; i++) {
      float distance = fetchLineDistance(i);
      if (distance > arrowDistance) {
          positionNumber = i;
          break;
      }
  }

  // line position just before the arrow
  vec3 linePosition1 = fetchLinePosition(positionNumber - 1);

  // line position just after the arrow
  vec3 linePosition2 = fetchLinePosition(positionNumber);

  // calculate arrow position by interpolation
  float lineDistance1 = fetchLineDistance(positionNumber - 1);
  float lineDistance2 = fetchLineDistance(positionNumber);
  float interpolationValue = (arrowDistance - lineDistance1) / (lineDistance2 - lineDistance1);    
  vec3 arrowPosition = mix(linePosition1, linePosition2, interpolationValue);  

  // clamp to arrow size limits
  float sizePixels = clamp(project_size_to_pixel(instanceSize), sizeMinPixels, sizeMaxPixels);

  // calculate rotation angle for aligning the arrow with the line segment
  float angle = atan(linePosition1.x - linePosition2.x, linePosition1.y - linePosition2.y) + radians(180.0);
  mat3 rotation = mat3(cos(angle),  sin(angle),  0,
                       -sin(angle), cos(angle),  0,
                       0,           0,           0);

  // project to clipspace 
  vec3 offset = positions * rotation * project_pixel_size(sizePixels);
  vec3 arrowPosition64Low = vec3(0, 0, 0);
  gl_Position = project_position_to_clipspace(arrowPosition, arrowPosition64Low, offset);

  // arrow fill color for fragment shader 
  vFillColor = instanceColor;
}
`;
