/**
 * Get the original name and email of App Script
 * @param {string} cloudProjectId of the cloud project
 * @param {string} cloudProjectName display name of the cloud project
 * @return {Object} having two values name, email and projectId
 *     name is the name of the cloud project
 *     email is the email id of the owner of apps script
 *     projectId is the cloud project Id
 */
function getOriginalNameAndOwnerOfScript(cloudProjectId, cloudProjectName) {
  var filter = 'protoPayload.methodName=CreateBrand';
  var firstPage = getFirstPageOfLogs(cloudProjectId, filter);
  var resultData = firstPage['resultData'];
  if (resultData == null) {
    return {};
  }
  return {
    'email': resultData.entries[0].protoPayload.request.brand.supportEmail,
    'name': cloudProjectName,
    'projectId': cloudProjectId
  };
}


/**
 * Get the owners of all the cloud projects
 * @param {String} projectType is the enum having values 
 *     {SYSTEM_PROJECT, ALL_PROJECT, SPECIFIC_PROJECT, CUSTOM_PROJECT}
 * @param {string} cloudProjectId is cloud project id of specific project otherwise null
 * @return {Object} Array of objects having name, email of owner 
 *     and projectId of Apps Script
 */
function getOwnersOfAllScripts(projectType, cloudProjectId) {
  var emailOfOwnerOfScripts = [];
  if (projectType == "SPECIFIC_PROJECT") {
    var projDetails = getProjectDetails(cloudProjectId);
    if (projDetails != null) {
      var apiEnabled = enableLogginApisPvt(projDetails.projectNumber);
      if (apiEnabled) {
        var owner =
          getOriginalNameAndOwnerOfScript(cloudProjectId, projDetails.name);
        emailOfOwnerOfScripts.push(owner);
      }
    }
  } else if (projectType == "ALL_PROJECT"){
    var allProjects = listAllCloudProjects();
    var i;
    for (i = 0; i < allProjects.length; i++) {
      if (allProjects[i].lifecycleState != 'ACTIVE') {
        continue;
      }
      var apiEnabled = enableLogginApisPvt(allProjects[i].projectNumber);
      if (!apiEnabled) {
        continue;
      }
      var owner =
        getOriginalNameAndOwnerOfScript(
          allProjects[i].projectId,
          allProjects[i].name
        );
      emailOfOwnerOfScripts.push(owner);
    }
  } else {
    var allProjects = listAllCloudProjects();
    var folderId = getSystemProjectsFolderId();
    var i;
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
      if (!apiEnabled) {
        continue;
      }
      var owner =
        getOriginalNameAndOwnerOfScript(
          allProjects[i].projectId,
          allProjects[i].name
        );
      emailOfOwnerOfScripts.push(owner);
    }
  }
  return emailOfOwnerOfScripts;
}
