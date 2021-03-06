/**
 * Get the maximum number of executions of a cloud project
 * @param {string} cloudProjectId of the cloud project
 * @param {Date} fromTime is the date and time 
 *    from which the executions has to be seen
 * @return {Object} having key as projectId and value as number of executions
 */
function getNumberOfExecutionOfScript(cloudProjectId, fromTime) {
  var max = 0;
  var i;
  var limit = false;
  var processIdsMap = {};
  var projectIdsMap = {};

  var firstPage = getFirstPageOfLogs(cloudProjectId);
  var pageToken = firstPage['nextPageToken'];
  var resultData = firstPage['resultData'];

  var header = {
    'Authorization': 'Bearer ' + ScriptApp.getOAuthToken()
  };
  var body = {
    'projectIds': [
      cloudProjectId
    ],
    'resourceNames': [
      'projects/' + cloudProjectId
    ],
    'pageToken': pageToken,
    'orderBy': "timestamp desc"
  };
  var options = {
    'method': 'post',
    'contentType': 'application/json',
    'headers': header,
    'payload': JSON.stringify(body),
    'muteHttpExceptions': false
  };
  var url = 'https://logging.googleapis.com/v2/entries:list';

  // loop to go over all the enteries and map the processId with the projectId
  while (resultData.entries) {
    for (i in resultData.entries) {
      if (resultData.entries[i].timestamp < fromTime) {
        limit = true;
        break;
      }
      if (resultData.entries[i].labels) {
        var processId =
          resultData.entries[i].labels['script.googleapis.com/process_id'];
        var projectId =
          resultData.entries[i].labels['script.googleapis.com/project_key'];
        processIdsMap[processId] = projectId;
      }
    }
    if (limit) {
      break;
    }
    body['pageToken'] = pageToken;
    options['payload'] = JSON.stringify(body);

    // these calls to the API are to fetch all the pages which have enteries
    try {
      var response = UrlFetchApp.fetch(url, options);
      var json = response.getContentText();
      resultData = JSON.parse(json);
      pageToken = resultData.nextPageToken;
    } catch (ex) {
      Logger.log(ex);
      break;
    }
  }

  // go through all the processIds and count the different projectIds
  for (i in processIdsMap) {
    if (projectIdsMap[processIdsMap[i]]) {
      projectIdsMap[processIdsMap[i]] += 1;
    } else {
      projectIdsMap[processIdsMap[i]] = 1;
    }
  }
  return projectIdsMap;
}

/**
 * Get the maximum executed Script from all the cloud projects
 * @param {Date} fromTime is the date and time from 
 *    which executions has to be seen
 * @param {String} projectType is the enum having values 
 *    {SYSTEM_PROJECT, ALL_PROJECT, SPECIFIC_PROJECT, CUSTOM_PROJECT}
 * @param {string} cloudProjectId is cloud project id of specific project 
 *    otherwise null
 * @return {Object} Array of projectIds along with the number of executions 
 *    of the executed scripts and the cloud project id
 */
function getMostExecutedScriptFromAllCloudProjects(
  fromTime, projectType, cloudProjectId) {
  var processIdWithExecutions = {};
  var processIdWithGCPId = {};
  if (projectType == "SPECIFIC_PROJECT") {
    var projDetails = getProjectDetails(cloudProjectId);
    if (projDetails != null) {
      var apiEnabled = enableLogginApisPvt(projDetails.projectNumber);
      if (apiEnabled) {
        var result = getNumberOfExecutionOfScript(cloudProjectId, fromTime);
        for (var j in result) {
          if (processIdWithExecutions[j]) {
            processIdWithExecutions[j] += result[j];
          } else {
            processIdWithExecutions[j] = result[j];
          }
          processIdWithGCPId[j] = cloudProjectId;
        }
      }
    }
  } else if (projectType == "ALL_PROJECT") {
    var allProjects = listAllCloudProjects();
    var i;
    var max = 0;

    // loop for all thr projects and get most executed scripts of each project
    for (i = 0; i < allProjects.length; i++) {
      if (allProjects[i].lifecycleState != 'ACTIVE') {
        continue;
      }
      var apiEnabled = enableLogginApisPvt(allProjects[i].projectNumber);
      if (!apiEnabled) continue;
      var result =
        getNumberOfExecutionOfScript(allProjects[i].projectId, fromTime);
      for (var j in result) {
        if (processIdWithExecutions[j]) {
          processIdWithExecutions[j] += result[j];
        } else {
          processIdWithExecutions[j] = result[j];
        }
        processIdWithGCPId[j] = allProjects[i].projectId;
      }
    }
  } else {
    var allProjects = listAllCloudProjects();
    var i;
    var max = 0;
    var folderId = getSystemProjectsFolderId();

    // loop for all thr projects and get most executed scripts of each project
    for (i = 0; i < allProjects.length; i++) {
      if (allProjects[i].lifecycleState != 'ACTIVE') {
        continue;
      }
      var parentId = allProjects[i].parent.id;
      // This is to check whether the project is the system project or not
      if (parentId == folderId) {
        if (projectType == "CUSTOM_PROJECT") continue;
      } else {
        if (projectType == "SYSTEM_PROJECT") continue;
      }
      var apiEnabled = enableLogginApisPvt(allProjects[i].projectNumber);
      if (!apiEnabled) continue;
      var result =
        getNumberOfExecutionOfScript(allProjects[i].projectId, fromTime);
      for (var j in result) {
        if (processIdWithExecutions[j]) {
          processIdWithExecutions[j] += result[j];
        } else {
          processIdWithExecutions[j] = result[j];
        }
        processIdWithGCPId[j] = allProjects[i].projectId;
      }
    }
  }
  var mostExecutedScript = convertObjectToSortedArrayForMostExecutedScript(
    processIdWithExecutions, processIdWithGCPId);
  return mostExecutedScript;
}
