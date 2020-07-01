"""
This module enables the logging API for a cloud project
"""
import json
import requests
def enable_loggin_apis_pvt(project_number, token):
    """
    Function for enabling the logging API for a cloud project

    Parameters:
        project_number (int):Project Number of the cloud project
        token (str):The authorization token for cloud Project

    Returns:
        boolean: whether logging API is enabled or not
    """
    name = "projects/" + project_number + "/services/logging.googleapis.com"
    url = "https://serviceusage.googleapis.com/v1/" + name + ":enable"
    header = {
        "Authorization" : token
    }
    try:
        response = requests.post(url, headers=header)
        context_text = response.text
        context_text = json.loads(context_text)
        if context_text.get('response') != None:
            if context_text['response']['service']['state'] == 'ENABLED':
                return True
        return False
    except requests.exceptions.RequestException as ex:
        print(ex)
        return False
