"""
This module returns the page token and the first page enteries
"""
import json
import requests

def get_first_page_of_logs(cloud_project_id, token, filter_value):
    """
    Function to get page token and the first page enteries

    Parameters:
        cloud_project_id (string):Project Id of the cloud project
        token (str):The authorization token for cloud Project
        filter_value (str): Filter for the owner of script

    Returns:
        object: Having two values next_page_token and result_data
    """
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
        "pageToken": None,
        "orderBy": "timestamp desc",
        "filter": filter_value
    }
#loop to get the first page which has enteries in it
    while True:
        response = requests.post(url, headers=header, params=body)
        result_data = response.text
        result_data = json.loads(result_data)
        if result_data.get('nextPageToken') is None:
            break
        page_token = result_data["nextPageToken"]
        body['pageToken'] = page_token
        if result_data.get("entries"):
            break
    return {'next_page_token': page_token, 'result_data': result_data}
