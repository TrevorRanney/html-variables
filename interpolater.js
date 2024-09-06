'use strict'

const interpolate = (inputString, data = {}) => {

    const regex = /{{((?:[^{}]|\{[^{}]*\})+)}}/g;
    const replacedString = inputString.replace(regex, (match, jsCode) => {
        try {
            var stringifiedVariables = '';
            for (let prop in data) {
                stringifiedVariables += `const ${prop} = ${JSON.stringify(data[prop]) || 'undefined'};\n`;
            }
            const evalResult = eval(`(function() { ${stringifiedVariables} return (${jsCode}); })()`);

            if (typeof (evalResult) === 'object') {
                return JSON.stringify(evalResult);
            }
            return evalResult !== undefined ? evalResult : '';
        } catch (error) {return '';
            console.log('error', error)
        }
    });

    return replacedString;
}

module.exports = interpolate;
