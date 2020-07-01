"""
This module returns the most Active Users
"""
import json
import requests
from all_cloud_projects import cloud_project
from enable_logging_api import enable_loggin_apis_pvt
from project_details import get_project_details

def get_users_with_process_id(cloud_project_id, from_time, token):
    """
    Function for returning the user_key with number of executions

    Parameters:
        cloud_project_id (string):Project Id of the cloud project
        from_time (string):Start time for the logs in ETC/GMT format
        token (str):The authorization token for cloud Project

    Returns:
        Dict: having user_key with the number of executions
    """

    page_token = None
    result_data = None
    limit = False
    process_ids_map = {}
    user_executions = {}

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
            "pageToken":page_token,
            "orderBy": "timestamp desc"
        }

        response = requests.post(url, headers=header, params=body)
        result_data = response.text
        result_data = json.loads(result_data)
        page_token = result_data["nextPageToken"]
        if result_data.get("entries"):
            break

    # loop to go over all the enteries and map the processId with the userId
    while result_data.get("entries"):
        for i in result_data["entries"]:
            if i["timestamp"] < from_time:
                limit = True
                break
            if i.get('labels'):
                if i['labels'].get("script.googleapis.com/process_id"):
                    process_id = i["labels"]["script.googleapis.com/process_id"]
                    user_key = i["labels"]["script.googleapis.com/user_key"]
                    process_ids_map[process_id] = user_key

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
            "pageToken": page_token,
            "orderBy": "timestamp desc"
        }
        response = requests.post(url, headers=header, params=body)
        result_data = response.text
        result_data = json.loads(result_data)
        if result_data.get('nextPageToken') == None:
            break
        page_token = result_data["nextPageToken"]

        for i in process_ids_map:
            if process_ids_map[i]:
                if user_executions.get(process_ids_map[i]):
                    user_executions[process_ids_map[i]] += 1
                else:
                    user_executions[process_ids_map[i]] = 1

    return user_executions

def get_most_active_user(from_time, project_type, token, cloud_project_id):
    """
    Function for returning the user_key with number of executions in desceding order

    Parameters:
        from_time (string):Start time for the logs in ETC/GMT format
        project_type (string):Enum project type {SPECIFIC_PROJECT, CUSTOM_PROJECT, SYSTEM_PROJECT, ALL_PROJECT}
        token (str):The authorization token for cloud Project
        cloud_project_id (string):Project Id of the cloud project

    Returns:
        Dict:Array having user_key with the number of executions
    """
    users = {}
    most_active_users = []
    if project_type == "SPECIFIC_PROJECT":
        proj_details = get_project_details(cloud_project_id, token)
        if proj_details != None:
            api_enabled = enable_loggin_apis_pvt(proj_details["projectNumber"], token)
            if api_enabled:
                user_executions = get_users_with_process_id(cloud_project_id, from_time, token)
                for j in user_executions:
                    if users.get(j):
                        users[j] += user_executions[j]
                    else:
                        users[j] = user_executions[j]
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
            user_executions = get_users_with_process_id(project_id, from_time, token)
            for j in user_executions:
                if users.get(j):
                    users[j] += user_executions[j]
                else:
                    users[j] = user_executions[j]

    for i in users:
        most_active_users.append({'key': i, 'value': users[i]})
    most_active_users.sort(key=lambda x: x["value"], reverse=True)
    return most_active_users
