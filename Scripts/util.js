// This file is not intended to run by itself, but is inserted into main.js

// extensions for saving and retrieving objects in localstorage
Storage.prototype.setObject = function (key, value) {
    this.setItem(key, JSON.stringify(value));
};
Storage.prototype.getObject = function (key, defaultvalue = undefined) {
    const value = this.getItem(key);
    if (value && value != undefined) {
        return JSON.parse(value);
    }
    return defaultvalue;
};

// function that returns the current local date of the user as a "YYYY-MM-DD" formatted string
function getLocalDate() {
    return new Date().toLocaleDateString("en-CA");
}

// function that checks a function returning a boolean and backs off for waitTime duration if it is not yet true, maximum numberOfTimesToCheck times
function recursiveCheckAndWait(
    checkFunction,
    waitTime,
    numberOfTimesToCheck,
    multiplyWaitTime = false,
    numberOfTimesChecked = 0
) {
    const checkFunctionResult = checkFunction();
    numberOfTimesChecked += 1;
    if (checkFunctionResult != false) {
        // if the function does not return false, return its value
        return checkFunctionResult;
    } else if (numberOfTimesToCheck - numberOfTimesChecked <= 0) {
        // if we have ran out of checks, return false
        return false;
    } else {
        // else create a new timeout to check again after the waitTime
        return new Promise((resolve) => {
            if (multiplyWaitTime == true) {
                // be aware that the waittime is passed as an argument and multiplied each time, so waitTime=500 and numberOfTimesToCheck=5 goes like: 0 (first is immediately), 500*1, 500*2, (500*2)*3, ((500*2)*3)*4
                waitTime = waitTime * numberOfTimesChecked;
            }
            setTimeout(() => {
                resolve(
                    recursiveCheckAndWait(
                        checkFunction,
                        waitTime,
                        numberOfTimesToCheck,
                        multiplyWaitTime,
                        numberOfTimesChecked
                    )
                );
            }, waitTime);
        });
    }
}

// function for mapping the difference between two objects
const deepDiffMapper = (function () {
    return {
        VALUE_CREATED: "created",
        VALUE_UPDATED: "updated",
        VALUE_DELETED: "deleted",
        VALUE_UNCHANGED: "---",
        map: function (obj1, obj2) {
            if (this.isFunction(obj1) || this.isFunction(obj2)) {
                throw "Invalid argument. Function given, object expected.";
            }
            if (this.isValue(obj1) || this.isValue(obj2)) {
                let returnObj = {
                    type: this.compareValues(obj1, obj2),
                    original: obj1,
                    updated: obj2,
                };
                if (returnObj.type != this.VALUE_UNCHANGED) {
                    return returnObj;
                }
                return undefined;
            }

            let diff = {};
            let foundKeys = {};
            for (let key in obj1) {
                if (this.isFunction(obj1[key])) {
                    continue;
                }

                let value2 = undefined;
                if (obj2[key] !== undefined) {
                    value2 = obj2[key];
                }

                let mapValue = this.map(obj1[key], value2);
                foundKeys[key] = true;
                if (mapValue) {
                    diff[key] = mapValue;
                }
            }
            for (let key in obj2) {
                if (this.isFunction(obj2[key]) || foundKeys[key] !== undefined) {
                    continue;
                }

                let mapValue = this.map(undefined, obj2[key]);
                if (mapValue) {
                    diff[key] = mapValue;
                }
            }

            //2020-06-13: object length code copied from https://stackoverflow.com/a/13190981/2336212
            if (Object.keys(diff).length > 0) {
                return diff;
            }
            return undefined;
        },
        compareValues: function (value1, value2) {
            if (value1 === value2) {
                return this.VALUE_UNCHANGED;
            }
            if (this.isDate(value1) && this.isDate(value2) && value1.getTime() === value2.getTime()) {
                return this.VALUE_UNCHANGED;
            }
            if (value1 === undefined) {
                return this.VALUE_CREATED;
            }
            if (value2 === undefined) {
                return this.VALUE_DELETED;
            }
            return this.VALUE_UPDATED;
        },
        isFunction: function (x) {
            return Object.prototype.toString.call(x) === "[object Function]";
        },
        isArray: function (x) {
            return Object.prototype.toString.call(x) === "[object Array]";
        },
        isDate: function (x) {
            return Object.prototype.toString.call(x) === "[object Date]";
        },
        isObject: function (x) {
            return Object.prototype.toString.call(x) === "[object Object]";
        },
        isValue: function (x) {
            return !this.isObject(x) && !this.isArray(x);
        },
    };
})();
