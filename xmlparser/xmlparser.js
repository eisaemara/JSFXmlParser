var fs = require('fs');
var xml2js = require('xml2js');
var parser = new xml2js.Parser();
var builder = new xml2js.Builder();
const SUPPORTED_ITEMS = ['oasis:OasisCard', 'oasis:FlexItem', 'af:dialog', 'oasis:OasisListOfValues', 'af:button', "af:column"];
let PAGE_NAME = 'TEST';
let script = [];

exports.parse = function(file, taskflowName) {

    fs.readFile(file, function(err, data) {
        script = [];
        parser.parseString(data, function(err, result) {
            var filename = file.replace(/^.*[\\\/]/, '');
            PAGE_NAME = filename.replace('.jsff', '');
            loopingForLabel('main', result);
            var builder = new xml2js.Builder();
            var xml = builder.buildObject(result);
            if (script.length > 0) {
                fs.writeFile("out\\" + PAGE_NAME + ".jsff", xml, 'utf8', function(err) {
                    if (err) {
                        console.log("An error occured while writing  Object to File.");
                        return console.log(err);
                    }
                    console.log("file has been saved.");
                });

                fs.writeFile("out\\" + PAGE_NAME + ".sql", script.join(''), 'utf8', function(err) {
                    if (err) {
                        console.log("An error occured while writing  Object to File.");
                        return console.log(err);
                    }
                    console.log("file has been saved.");
                });
            }


        });
    });

    loopingForLabel = function(parentName, item) {
        let keys = Object.keys(item);
        keys.forEach(function(key) {
            //console.log("Key ::: " + key);
            let value = item[key];
            if (key === '$') { // properties
                validateItemProps(parentName, value);
            } else if (Array.isArray(value)) {

                value.forEach(function(child) {
                    loopingForLabel(key, child);
                });
            } else {
                loopingForLabel(key, value);
            }
        })
    }

    validateItemProps = function(componentName, props) {
        if (SUPPORTED_ITEMS.includes(componentName)) {
            console.log('starting working in item :: ' + componentName);
            const labelAttr = findLabelAttrName(componentName);
            if (!skipComponent(componentName, props, labelAttr)) {
                console.log('APPLY LABEL RULES FOR  :: ' + componentName);
                applyLabelRule(componentName, props, labelAttr);
            }
        }
    }
    applyLabelRule = function(componentName, props, labelAttr) {
        let labelValue = props[labelAttr];
        const compId = props['id']; //cannot be null
        const genKey = (taskflowName + '_' + PAGE_NAME + '_' + compId).toUpperCase();
        props[labelAttr] = ("#{messages['" + genKey + "']}");

        script.push("exec Add_Resource_Key('" + genKey + "','" + labelValue + "','" + labelValue + "');\n");
        //exec Add_Resource_Key('TESTKEY','TEST','تجربة');


    }
    findLabelAttrName = function(componentName) {
        if ('oasis:OasisCard' === componentName || 'af:dialog' === componentName) {
            return 'title';
        } else if ('oasis:FlexItem' == componentName) {
            return "label";
        } else if ('oasis:OasisListOfValues' === componentName) {
            return 'popupTitle';
        } else if ('af:button' === componentName) {
            return 'text';
        } else if ('af:column' === componentName) {
            return 'headerText';
        }

    }
    skipComponent = function(componentName, props, labelAttr) {
        let result = (props[labelAttr] && props[labelAttr].indexOf('#{') != -1)
        console.log('skip   ---- > ' + result);
        return result;
    }
}