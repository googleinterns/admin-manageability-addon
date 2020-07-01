"""
This module returns the email of owner of Apps Script
"""
import json
import requests
from all_cloud_projects import cloud_project
from enable_logging_api import enable_loggin_apis_pvt
from project_details import get_project_details

def get_name_and_owner_of_script(cloud_project_id, project_name, token):
    """
    Function for returning the email of owner of Apps Script

    Parameters:
        cloud_project_id (string):Project Id of the cloud project
        project_name (string):Name of the Apps Script project
        token (str):The authorization token for cloud Project

    Returns:
        Dict: Object having email of owner, name and cloud project Id
    """
    page_token = None
    result_data = None
    while True:
        url = "https://logging.googleapis.com/v2/entries:list"
        header = {
            "Authorization": token
        }
        body = {
            "projectIds": [
                cloud_project_id
            ],
            "resourceNames": [
                "projects/"+cloud_project_id
            ],
            "filter": "protoPayload.methodName=CreateBrand",
            "orderBy": "timestamp desc",
            "pageToken": page_token
        }
        response = requests.post(url, headers=header, params=body)
        result_data = response.text
        result_data = json.loads(result_data)
        if result_data.get("nextPageToken"):
            page_token = result_data["nextPageToken"]
        if result_data.get("entries"):
            break
    entry = result_data['entries'][0]
    return {
        "email": entry['protoPayload']['request']['brand']['supportEmail'],
        "name": project_name,
        "projectId": cloud_project_id
    }

def get_owners_of_all_scripts(project_type, token, cloud_project_id):
    """
    Function for returning the email of owner of Apps Script

    Parameters:
        project_type (string):Enum project type {SPECIFIC_PROJECT, CUSTOM_PROJECT, SYSTEM_PROJECT, ALL_PROJECT}
        token (str):The authorization token for cloud Project
        cloud_project_id (string):Project Id of the cloud project

    Returns:
        Array: Array having email of owner, name and cloud project Id
    """
    email_of_owner_of_scripts = []
    if project_type == "SPECIFIC_PROEJCT":
        proj_details = get_project_details(cloud_project_id, token)
        api_enabled = enable_loggin_apis_pvt(proj_details["projectNumber"], token)
        if api_enabled:
            owner = get_name_and_owner_of_script(cloud_project_id, proj_details["name"], token)
            email_of_owner_of_scripts.append(owner)
    else:
        all_project = cloud_project(token)
        for project in all_project:
            if project["lifecycleState"] != 'ACTIVE':
                continue
            project_id = project["projectId"]
            if project_id.startswith("sys"):
                if project_type == "CUSTOM_PROJECT":
                    continue
            else:
                if project_type == "SYSTEM_PROJECT":
                    continue
            api_enabled = enable_loggin_apis_pvt(project["projectNumber"], token)
            if api_enabled == False:
                continue
            owner = get_name_and_owner_of_script(project_id, project["name"], token)
            email_of_owner_of_scripts.append(owner)
    return email_of_owner_of_scripts
