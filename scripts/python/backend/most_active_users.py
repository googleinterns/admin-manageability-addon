"""
This module returns the most Active Users
"""
import json
import requests
from all_cloud_projects import cloud_project
from enable_logging_api import enable_loggin_apis_pvt
from project_details import get_project_details
from helper import get_first_page_of_logs, get_system_projects_folder_id

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
    limit = False
    process_ids_map = {}
    user_executions = {}

    first_page = get_first_page_of_logs(cloud_project_id, token, None)
    page_token = first_page['next_page_token']
    result_data = first_page['result_data']

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

    # loop to go over all the enteries and map the processId with the userId
    while result_data.get("entries"):
        for i in result_data["entries"]:
            if i["timestamp"] < from_time:
                limit = True
                break
            if i.get('labels'):
                if i['labels'].get("script.googleapis.com/process_id") and i['labels'].get("script.googleapis.com/user_key"):
                    process_id = i["labels"]["script.googleapis.com/process_id"]
                    user_key = i["labels"]["script.googleapis.com/user_key"]
                    # print (process_id, user_key)
                    process_ids_map[process_id] = user_key
        if limit:
            break

        response = requests.post(url, headers=header, params=body)
        result_data = response.text
        result_data = json.loads(result_data)
        if result_data.get('nextPageToken') is None:
            break
        page_token = result_data["nextPageToken"]
        body['pageToken'] = page_token
    for i in process_ids_map:
        if process_ids_map[i]:
            if user_executions.get(process_ids_map[i]):
                user_executions[process_ids_map[i]] += 1
            else:
                user_executions[process_ids_map[i]] = 1
    return user_executions

def get_most_active_user(from_time, project_type, token, cloud_project_id, que):
    """
    Function for returning the user_key with number of executions in desceding order

    Parameters:
        from_time (string):Start time for the logs in ETC/GMT format
        project_type (string):Enum project type {SPECIFIC_PROJECT, CUSTOM_PROJECT, SYSTEM_PROJECT, ALL_PROJECT}
        token (str):The authorization token for cloud Project
        cloud_project_id (string):Project Id of the cloud project
        que (Queue):queue to store the most active users based on number of executions

    """
    users = {}
    most_active_users = []
    if project_type == "SPECIFIC_PROJECT":
        proj_details = get_project_details(cloud_project_id, token)
        if not proj_details is None:
            api_enabled = enable_loggin_apis_pvt(proj_details["projectNumber"], token)
            if api_enabled:
                user_executions = get_users_with_process_id(cloud_project_id, from_time, token)
                for j in user_executions:
                    if users.get(j):
                        users[j] += user_executions[j]
                    else:
                        users[j] = user_executions[j]
    elif project_type == "ALL_PROJECT":
        all_project = cloud_project(token)
        for project in all_project:
            if project["lifecycleState"] != 'ACTIVE':
                continue
            project_id = project["projectId"]
            api_enabled = enable_loggin_apis_pvt(project["projectNumber"], token)
            if not api_enabled:
                continue
            user_executions = get_users_with_process_id(project_id, from_time, token)
            for j in user_executions:
                if users.get(j):
                    users[j] += user_executions[j]
                else:
                    users[j] = user_executions[j]
    else:
        all_project = cloud_project(token)
        folder_id = get_system_projects_folder_id(token)
        for project in all_project:
            if project["lifecycleState"] != 'ACTIVE':
                continue
            project_id = project["projectId"]
            parent_id = project["parent"]['id']
            if parent_id == folder_id:
                if project_type == "CUSTOM_PROJECT":
                    continue
            else:
                if project_type == "SYSTEM_PROJECT":
                    continue
            api_enabled = enable_loggin_apis_pvt(project["projectNumber"], token)
            if not api_enabled:
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
    que.put(most_active_users)
