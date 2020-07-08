"""
This module creates a server at port 5000 which listens to the API calls
It listens to three API calls which are mostExecutedScript, mostActiveUsers or emailOfOwner
"""
import json
import queue
import threading
from flask import Flask, request
from flask_restful import Resource, Api
from most_executed_script import get_most_executed_script_from_cloud_projects
from most_active_users import get_most_active_user
from owner_of_scripts import get_owners_of_all_scripts

app = Flask(__name__)
api = Api(app)

# A dictionary for storing the threads with the string
threads = {}

class MostExecutedScript(Resource):
    """
    Class for the Most Executed Script
    """
    def post(self):
        """
        Post method for giving the most Executed Script

        Returns:
            array: Array of objects having process Id, number of executions and cloud Project Id
        """
        json_data = request.data
        json_data = json.loads(json_data)
        if json_data.get('token') is None:
            auth_token = request.headers.get('Authorization')
            from_time = json_data["fromTime"]
            project_type = json_data["projectType"]
            if project_type == "SPECIFIC_PROJECT":
                project_id = json_data["projectId"]
            else:
                project_id = None
            que = queue.Queue()
            thread = threading.Thread(target=get_most_executed_script_from_cloud_projects, args=(from_time, project_type, auth_token, project_id, que))
            thread.start()
            threads[auth_token + "mostExecutedScript"] = {'thread': thread, 'queue' : que}
            return auth_token + "mostExecutedScript"
        
        thread = threads[json_data.get('token')]['thread']
        que = threads[json_data.get('token')]['queue']
        if thread.isAlive():
            return None
        del threads[json_data.get('token')]
        return que.get()

class MostActiveUsers(Resource):
    """
    Class for the Most Active Users
    """
    def post(self):
        """
        Post method for giving the most Active Users

        Returns:
            array: Array of objects having user Id, number of executions
        """
        json_data = request.data
        json_data = json.loads(json_data)
        if json_data.get('token') is None:
            auth_token = request.headers.get('Authorization')
            from_time = json_data["fromTime"]
            project_type = json_data["projectType"]
            if project_type == "SPECIFIC_PROJECT":
                project_id = json_data["projectId"]
            else:
                project_id = None
            que = queue.Queue()
            thread = threading.Thread(target=get_most_active_user, args=(from_time, project_type, auth_token, project_id, que))
            thread.start()
            threads[auth_token + "mostActiveUsers"] = {'thread': thread, 'queue' : que}
            return auth_token + "mostActiveUsers"
 
        thread = threads[json_data.get('token')]['thread']
        que = threads[json_data.get('token')]['queue']
        if thread.isAlive():
            return None
        del threads[json_data.get('token')]
        return que.get()

class EmailOfOwner(Resource):
    """
    Class for the Email of Owner of Apps Script
    """
    def post(self):
        """
        Post method for giving the email of owner of Apps script

        Returns:
            array: Array of objects having email of owner, name of Apps Script and cloud Project Id
        """
        json_data = request.data
        json_data = json.loads(json_data)
        if json_data.get('token') is None:
            auth_token = request.headers.get('Authorization')
            project_type = json_data["projectType"]
            if project_type == "SPECIFIC_PROJECT":
                project_id = json_data["projectId"]
            else:
                project_id = None
            que = queue.Queue()
            thread = threading.Thread(target=get_owners_of_all_scripts, args=(project_type, auth_token, project_id, que))
            thread.start()
            threads[auth_token] = {'thread': thread, 'queue' : que}
            return auth_token
        thread = threads[json_data.get('token')]['thread']
        que = threads[json_data.get('token')]['queue']
        if thread.isAlive():
            return None
        del threads[json_data.get('token')]
        return que.get()

api.add_resource(MostExecutedScript, '/mostExecutedScript')
api.add_resource(MostActiveUsers, '/mostActiveUsers')
api.add_resource(EmailOfOwner, '/emailOfOwnerOfScript')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=80)
