/**
* Sort the Array of Objects in Descending order on the label key
* @param {Object} array will have key value pair
* @param {String} key will be the label on which sorting has to be done of array
* @return {Object} sorted Array in descending order 
*/
function sortByKey(array, key) {
  return array.sort(function(a, b) {
   var x = a[key]; 
   var y = b[key];
   return (y-x);
  });
}
