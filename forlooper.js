'use strict'

const path = require('path')
const fs = require('fs')
const _baseRoute = './'

const interpolate = require('./interpolater')

    // Match and replace `[[...]]` only outside of $for blocks
    // const subPageRegex = /\[\[(.*?)\]\](?=(?:[^$]|$for\{[^}]*?\}[^$])*?\$|$)/g;
    // const subPageRegex = /\[\[(.*?)\]\](?![^$]*\})/g;
    // const subPageRegex = /\[\[(.*?)\]\](?![^{]*\})/g;
    const getSubPages = (html, variables) => {
        const subPageRegex = /\[\[(.*?)\]\]/g;
    
        const subpages = html.replace(subPageRegex, (_, pageName) => {
            return getPage(pageName, variables);
        });
    
        return subpages;
    }
    
    const getPage = (pageNameNoVars, variables) => {
        var pageName = interpolate(pageNameNoVars, variables || {});
    
        // Regular expression to match text between parentheses after page name
        const regex = /\((\w+):\s*([^)]+)\)/g;
        const extractedValues = {};
        let match;
        while ((match = regex.exec(pageName))) {
            const variableName = match[1];
            const variableValue = match[2];
            extractedValues[variableName] = variableValue;
        }
    
        pageName = pageName.replace(/\((.*?)\)/g, '');
    
        const pagePath = path.join(_baseRoute, pageName);
    
        const html = fs.readFileSync(pagePath);
        var stringHtml = html.toString();
    
        const vars = Object.assign({}, extractedValues, variables);
        stringHtml = loop(stringHtml, variables || {});
        stringHtml = interpolate(stringHtml, {...vars, variables});
        const subs = getSubPages(stringHtml, variables);
        return subs;
    }
    

const processLoop = (str, start, variables, nested, nestedIteration) => {
    var closeBracket;
    var openBrackets = 0;
    var subVarStart;
    var subVarEnd;
    var loopVarStart;
    var loopVarEnd;
    var firstBracket;
    for (var i = start; i < str.length; i++) {
        // process.stdout.write(str[i]);
        if (str[i] == '(' && !subVarStart) subVarStart = i + 1;
        if (subVarStart && !subVarEnd && str[i] == ':') { subVarEnd = i; loopVarStart = i + 1 };
        if (loopVarStart && !loopVarEnd && str[i] == ')') { loopVarEnd = i };
        if (!firstBracket && str[i] == '{') { firstBracket = i + 1 };

        if (str[i] == '{') openBrackets++;
        else if (str[i] == '}') {
            openBrackets--;
            if (openBrackets <= 0) { closeBracket = i; break }
        }
    }
    var subVar = str.substring(subVarStart, subVarEnd).trim();
    var loopVar =  str.substring(loopVarStart, loopVarEnd).trim();
    var loopCode = str.substring(firstBracket, closeBracket).trim();

    // console.log('subVar', subVar,'loopVar', loopVar, 'loopCode', loopCode)

    //this really belongs in the for loop and it should be replacing the varibales
    if(nested){
        const evalResult = eval(`(function(variables) { return (variables.${nested}); })(variables)`);
        // variables = evalResult[nestedIteration]
        variables = { ...evalResult[nestedIteration], variables}
    }

    var html = "";

    var splits = loopVar.split('.')
    var arr = variables

    for (var i = 0; i < splits.length; i++) {
        var split = splits[i];
        if (arr && (arr[split] || arr.hasOwnProperty(split))) {
            arr = arr[split];
        }
    }
    // console.log('arr', arr)
    if (Array.isArray(arr)) {
        // const evalResult = eval(`(function(variables) { return (variables.${loopVar}); })(variables)`);
        // console.log('next vairbales', evalResult)
        for (const [i, v] of arr.entries()) {
            // const newVariables = evalResult[i];
            // console.log('new variables', newVariables)
            // const newHTML = interpolate(getSubPages(loop(loopCode, {variables: evalResult[i] }), {variables: evalResult[i] } ), { [subVar]: v, loop: i, ...variables, index: i });
            const newHTML = interpolate(getSubPages(loop(loopCode,  {...variables, [subVar]: v, index: i } , loopVar, i), {...variables, [subVar]: v, index: i }  ), { [subVar]: v, loop: i, ...variables, index: i });
            html += newHTML;
        }
    }

    var htmlStart = str.substring(0, start);
    var htmlEnd = str.substring(closeBracket + 1, str.length);

    return htmlStart + html + htmlEnd;
}

const loop = (str, variables, nested, nestedIteration) => {
    while (str.indexOf('$for') != -1) {
        var loopIndex = str.indexOf('$for')
        str = processLoop(str, loopIndex, variables, nested, nestedIteration)
    }
    return str
}
module.exports = {loop, getPage, getSubPages};
