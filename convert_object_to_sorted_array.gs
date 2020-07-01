/**
* Convert JSON object to array sorted in descending order of their values
* @param {Object} object will have key value pair
* @param {Object} processIdWithGCPId will have key value pair with key as processId and value as Cloud ProjectId
* @return {Object} Sorted Array of the JSON object having key as ProcessId value as execution count and GCPId as cloud project id in descending order
*/
function convertObjectToSortedArray(object, processIdWithGCPId) {
  var array = new Array();
  for(var i in object) {
    array.push(
      {
        "key" : i, 
        "value" : object[i], 
        "GCPId" : processIdWithGCPId[i]
      }
    );
  }
  
  // get the sorted array
  var sortedArray = sortByKey(array, "value");
  return sortedArray;
}

/**
* Convert JSON object to array sorted in descending order of their values
* @param {Object} object will have key value pair
* @return {Object} Sorted Array of the JSON object having key as UserId value as execution count in descending order
*/
function convertObjectToSortedArrayForMostActiveUsers(object) {
  var array = new Array();
  for(var i in object) {
    array.push(
      {
        "key" : i,
        "value" : object[i]
      }
    );
  }
  
  // get the sorted array
  var sortedArray = sortByKey(array, "value");
  return sortedArray;
}
