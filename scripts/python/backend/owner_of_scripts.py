"""
This module returns the email of owner of Apps Script
"""
from all_cloud_projects import cloud_project
from enable_logging_api import enable_loggin_apis_pvt
from project_details import get_project_details
from helper import get_first_page_of_logs, get_system_projects_folder_id

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
    first_page = get_first_page_of_logs(cloud_project_id, token, "protoPayload.methodName=CreateBrand")
    result_data = first_page['result_data']
    entry = result_data['entries'][0]
    return {
        "email": entry['protoPayload']['request']['brand']['supportEmail'],
        "name": project_name,
        "projectId": cloud_project_id
    }


def get_owners_of_all_scripts(project_type, token, cloud_project_id, que):
    """
    Function for returning the email of owner of Apps Script

    Parameters:
        project_type (string):Enum project type {SPECIFIC_PROJECT, CUSTOM_PROJECT, SYSTEM_PROJECT, ALL_PROJECT}
        token (str):The authorization token for cloud Project
        cloud_project_id (string):Project Id of the cloud project
        que (Queue):queue to store the email of owner of apps scripts

    """
    email_of_owner_of_scripts = []
    if project_type == "SPECIFIC_PROJECT":
        proj_details = get_project_details(cloud_project_id, token)
        api_enabled = enable_loggin_apis_pvt(proj_details["projectNumber"], token)
        if api_enabled:
            owner = get_name_and_owner_of_script(cloud_project_id, proj_details["name"], token)
            email_of_owner_of_scripts.append(owner)
    elif project_type == "ALL_PROJECT":
        all_project = cloud_project(token)
        for project in all_project:
            if project["lifecycleState"] != 'ACTIVE':
                continue
            project_id = project["projectId"]
            api_enabled = enable_loggin_apis_pvt(project["projectNumber"], token)
            if not api_enabled:
                continue
            owner = get_name_and_owner_of_script(project_id, project["name"], token)
            email_of_owner_of_scripts.append(owner)
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
            owner = get_name_and_owner_of_script(project_id, project["name"], token)
            email_of_owner_of_scripts.append(owner)
    que.put(email_of_owner_of_scripts)
