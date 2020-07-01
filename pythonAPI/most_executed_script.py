"""
This module returns the most Executed Script
"""
import json
import requests
from all_cloud_projects import cloud_project
from enable_logging_api import enable_loggin_apis_pvt
from project_details import get_project_details

def get_number_of_execution_of_script(cloud_project_id, from_time, token):
    """
    Function for returning the project Id with number of executions

    Parameters:
        cloud_project_id (string):Project Id of the cloud project
        from_time (string):Start time for the logs in ETC/GMT format
        token (str):The authorization token for cloud Project

    Returns:
        Dict: Object having project Id with the number of executions
    """
    limit = False
    process_ids_map = {}
    project_ids_map = {}
    page_token = None
    #loop to get the first page which has enteries in it
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
            "pageToken": page_token,
            "orderBy": "timestamp desc"
        }

        response = requests.post(url, headers=header, params=body)
        result_data = response.text
        result_data = json.loads(result_data)
        if result_data.get('nextPageToken') == None:
            break
        page_token = result_data["nextPageToken"]
        if result_data.get("entries"):
            break

    while result_data.get("entries"):
        for i in result_data["entries"]:
            if i["timestamp"] < from_time:
                limit = True
                break
            if i.get('labels'):
                if i['labels'].get("script.googleapis.com/process_id"):
                    process_id = i["labels"]["script.googleapis.com/process_id"]
                    project_id = i["labels"]["script.googleapis.com/project_key"]
                    process_ids_map[process_id] = project_id

        if limit:
            break
        url = 'https://logging.googleapis.com/v2/entries:list'
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
            "pageToken":page_token,
            "orderBy": "timestamp desc"
        }
        response = requests.post(url, headers=header, params=body)
        result_data = response.text
        result_data = json.loads(result_data)
        if result_data.get('nextPageToken') == None:
            break
        page_token = result_data["nextPageToken"]

    # go through all the processIds and count the different projectIds
    for i in process_ids_map:
        if project_ids_map.get(process_ids_map[i]):
            project_ids_map[process_ids_map[i]] += 1
        else:
            project_ids_map[process_ids_map[i]] = 1
    return project_ids_map

def get_most_executed_script_from_cloud_projects(from_time, project_type, token, cloud_project_id):
    """
    Function for returning the project Id with number of executions in desceding order

    Parameters:
        from_time (string):Start time for the logs in ETC/GMT format
        project_type (string):Enum project type {SPECIFIC_PROJECT, CUSTOM_PROJECT, SYSTEM_PROJECT, ALL_PROJECT}
        token (str):The authorization token for cloud Project
        cloud_project_id (string):Project Id of the cloud project

    Returns:
        Dict:Array having project Id with the number of executions
    """
    most_executed_script = []
    if project_type == "SPECIFIC_PROJECT":
        project_details = get_project_details(cloud_project_id, token)
        api_enabled = enable_loggin_apis_pvt(project_details["projectNumber"], token)
        if api_enabled:
            result = get_number_of_execution_of_script(cloud_project_id, from_time, token)
            for j in result:
                most_executed_script.append(
                    {
                        'key': j,
                        'value': result[j],
                        'GCPId': cloud_project_id
                    }
                )
    else:
        all_project = cloud_project(token)

        #loop for all the projects and get most executed scripts of each project
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
            result = get_number_of_execution_of_script(project_id, from_time, token)
            for j in result:
                most_executed_script.append({'key' : j, 'value' : result[j], 'GCPId' : project_id})
    most_executed_script.sort(key=lambda x: x["value"], reverse=True)
    return most_executed_script
