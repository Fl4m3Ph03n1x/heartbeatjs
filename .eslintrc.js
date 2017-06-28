module.exports = {
    "env": {
        "es6": true,
        "node": true,
        "mocha": true
    },
    "parserOptions": {
        "ecmaVersion": 2017,
        "sourceType": "module"
    },
    "extends": "eslint:recommended",
    "rules": {
        "eqeqeq": [
            "error",
            "always"
        ],
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "double"
        ],
        "semi": [
            "error",
            "always"
        ],
        "no-console": 0,
        "no-var": [ "error" ],
        "prefer-const": [ "error", {
            "destructuring": "any",
            "ignoreReadBeforeAssign": false
    } ]
    }
};
