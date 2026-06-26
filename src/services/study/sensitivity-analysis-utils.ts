/**
 * Copyright (c) 2026, RTE (http://www.rte-france.com)
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
const UUID_REGEX = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/**
 * Extracts all unique UUIDs found inside a varId string in SensitivityOfTo like
 * "[uuid1, uuid2] (REGULAR)" — finds all UUIDs inside brackets.
 */
export function extractUuidsFromVariationId(variationId: string): string[] {
    return [...variationId.matchAll(UUID_REGEX)].map((match) => match[0]);
}

/**
 * Replaces all UUIDs in a varId string in SensitivityOfTo with the corresponding
 * directory's element name from the provided map. UUIDs not found in the map are left as-is.
 */
export function resolveForVariationId(variationId: string, nameByUuid: Map<string, string>): string {
    return variationId.replace(UUID_REGEX, (uuid) => nameByUuid.get(uuid) ?? uuid);
}
