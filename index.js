const parser = require('fast-xml-parser');
const he = require('he');
const fs = require('fs');

const options = {
    attributeNamePrefix: "@_",
    attrNodeName: "attr", //default is 'false'
    textNodeName: "#text",
    ignoreAttributes: true,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: false,
    trimValues: true,
    cdataTagName: "__cdata", //default is 'false'
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: false, //"strict"
    attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }),//default is a=>a
    tagValueProcessor: (val, tagName) => he.decode(val), //default is a=>a
    stopNodes: ["parse-me-as-string"]
};

const xmlData = fs.readFileSync('./req.xml', 'utf8');

if (parser.validate(xmlData) === true) { //optional (it'll return an object in case it's not valid)
    var jsonObj = parser.parse(xmlData, options);
}

// Intermediate obj
var tObj = parser.getTraversalObj(xmlData, options);
var jsonObj = parser.convertToJson(tObj, options);

// remove Password
delete jsonObj['s:Header']['Security']['wsse:UsernameToken']['wsse:Password']

console.log('output the SOAP-methods');
console.log(Object.keys(jsonObj['s:Body']));

const isObject = (obj) => {
    return typeof obj === 'object' && obj !== null
}

const removeNameSpacesRecursively = (obj) => {
    for (const key of Object.keys(obj)) {
        if (isObject(obj)) {
            removeNameSpacesRecursively(obj[key]);
        }
        if (key.includes(':')) {
            const oldKey = key;
            const newKey = key.split(':')[1];
            // console.log(oldKey, '->', newKey);
            delete Object.assign(obj, { [newKey]: obj[oldKey] })[oldKey];
        }
    }
}

const keyAsMemberRecursively = (obj) => {
    for (const key of Object.keys(obj)) {
        if (isObject(obj)) {
            keyAsMemberRecursively(obj[key]);
            obj[key]['_this'] = key;
        }
    }
}

removeNameSpacesRecursively(jsonObj);
console.log('Object w/o namespaces');
// console.log(JSON.stringify(jsonObj, null, 2));

keyAsMemberRecursively(jsonObj);
console.log('Final Object');
console.log(JSON.stringify(jsonObj, null, 2));