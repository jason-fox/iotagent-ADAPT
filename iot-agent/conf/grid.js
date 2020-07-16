const transforms = require('../lib/adapters/transforms');
const schema = require('../lib/adapters/schema');
const FMIS = transforms.FMIS;
const MICS = transforms.MICS;

const isoxmlType = 'GRD';
const ngsiType = 'Grid';

/*
A GridMinimumNorthPosition
B GridMinimumEastPosition
C GridCellNorthSize
D GridCellEastSize
E GridMaximumColumn
F GridMaximumRow
G Filename 
H Filelength
I GridType
J TreatmentZoneCode
*/

/**
 * This function maps an NGSI object to an ISOXML GRD
 */
function transformFMIS(entity) {
    const xml = {};
    xml[isoxmlType] = { _attr: {} };
    const attr = xml[isoxmlType]._attr;
    FMIS.addId(attr, entity, isoxmlType);
    FMIS.addAttribute(attr, entity, 'B', 'familyName');

    MICS.addAttribute(attr, entity, 'A', 'position');
    MICS.addAttribute(attr, entity, 'C', 'cellNorthSize');
    MICS.addAttribute(attr, entity, 'D', 'cellEastSize');
    MICS.addAttribute(attr, entity, 'E', 'maxColumn');
    MICS.addAttribute(attr, entity, 'F', 'maxRow');
    MICS.addAttribute(attr, entity, 'G', 'filename');
    MICS.addAttribute(attr, entity, 'H', 'fileLength');
    MICS.addAttribute(attr, entity, 'I', 'gridType');
    MICS.addAttribute(attr, entity, 'J', 'treatmentZoneCode');

    return xml;
}

/**
 * This function maps an ISOXML GRD to an NGSI object
 */
function transformMICS(entity, normalized) {
    MICS.addGeoPointProperty(entity, 'A', 'position', 'geo:json', normalized);
    MICS.addFloat(entity, 'C', 'cellNorthSize', schema.NUMBER, normalized);
    MICS.addFloat(entity, 'D', 'cellEastSize', schema.NUMBER, normalized);
    MICS.addInt(entity, 'E', 'maxColumn', schema.NUMBER, normalized);
    MICS.addInt(entity, 'F', 'maxRow', schema.NUMBER, normalized);
    MICS.addProperty(entity, 'G', 'filename', schema.TEXT, normalized);
    MICS.addInt(entity, 'H', 'fileLength', schema.NUMBER, normalized);
    MICS.addInt(entity, 'I', 'gridType', schema.NUMBER, normalized);
    MICS.addInt(entity, 'J', 'treatmentZoneCode', schema.NUMBER, normalized);

    return entity;
}

module.exports = {
    transformFMIS,
    transformMICS,
    isoxmlType,
    ngsiType
};
