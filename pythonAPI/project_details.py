"""
This module returns the details of a cloud project
"""
import json
import requests
def get_project_details(cloud_project_id, token):
    """
    Function for returning the details of a cloud project

    Parameters:
        cloud_project_id (string):Project Id of the cloud project
        token (str):The authorization token for cloud Project

    Returns:
        object: Project details such as name, Project id, lifeCycleState etc.
    """
    url = "https://cloudresourcemanager.googleapis.com/v1/projects/"+cloud_project_id
    header = {
        "Authorization" : token
    }
    response = requests.get(url, headers=header)
    context_text = response.text
    project_details = json.loads(context_text)
    return project_details
