/**
* Convert JSON object to array sorted in descending order of their values
* @param {Object} processIdWithExecutions will have key value pair with key as processId and value as number of executions
* @param {Object} processIdWithGCPId will have key value pair with key as processId and value as Cloud ProjectId
* @return {Object} Sorted Array of the JSON object having key as ProcessId value as execution count and GCPId as cloud project id in descending order
*/
function convertObjectToSortedArrayForMostExecutedScript(processIdWithExecutions, processIdWithGCPId) {
  var mostExecutedScript = new Array();
  for(var i in processIdWithExecutions) {
    mostExecutedScript.push(
      {
        "key" : i, 
        "value" : processIdWithExecutions[i], 
        "GCPId" : processIdWithGCPId[i]
      }
    );
  }
  
  // get the sorted array
  var mostExecutedScriptSortedArray = sortByKey(mostExecutedScript, "value");
  return mostExecutedScriptSortedArray;
}

/**
* Convert JSON object to array sorted in descending order of their values
* @param {Object} userIdWithExecutions will have key value pair with key as user id and value as number of executions
* @return {Object} Sorted Array of the JSON object having key as UserId value as execution count in descending order
*/
function convertObjectToSortedArrayForMostActiveUsers(userIdWithExecutions) {
  var mostActiveUsers = new Array();
  for(var i in userIdWithExecutions) {
    mostActiveUsers.push(
      {
        "key" : i,
        "value" : userIdWithExecutions[i]
      }
    );
  }
  
  // get the sorted array
  var mostActiveUsersSortedArray = sortByKey(mostActiveUsers, "value");
  return mostActiveUsersSortedArray;
}
