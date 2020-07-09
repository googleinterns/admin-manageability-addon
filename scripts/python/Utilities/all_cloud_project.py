"""
This module returns all the cloud project of the organization
"""
import json
import requests
def cloud_project(token):
    """
    Function for getting all the cloud projects of the organization

    Parameters:
        token (str):The authorization token for cloud Project

    Returns:
        array: Array of projects having details as name, Project id, lifeCycleState etc.
    """
    url = "https://cloudresourcemanager.googleapis.com/v1/projects"
    header = {
        "Authorization" : token
    }
    response = requests.get(url, headers=header)
    context_text = response.text
    context_text = json.loads(context_text)
    all_projects = context_text['projects']
    return all_projects
