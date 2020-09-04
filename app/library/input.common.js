var isValid = function(input) {
    var result = (input !== null && input !== undefined)
    return result;
}

var getElementFromArray = function (array, item) {
    var selectedItem = null;
    for (var a = 0; a < array.length; a++) {
        if (array[a] === item) {
            selectedItem = array[a];
            break;
        }
    }
    return selectedItem;
}
var methods = {
    isValid: isValid,
    getElementFromArray:getElementFromArray
}


module.exports = methods;

// #region Private Methods
// #end-region Private Methods