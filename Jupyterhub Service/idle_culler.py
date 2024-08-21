import json
import os
from urllib.parse import urlparse
import requests
from tornado.httpserver import HTTPServer
from tornado.ioloop import IOLoop
from tornado.web import Application, RequestHandler, authenticated
import argparse
from jupyterhub.services.auth import HubAuthenticated




class IdleCullerHandler(HubAuthenticated, RequestHandler):
    @authenticated
    def post(self):
        api_url = 'https://lab.databrix.org/jupyterhub/hub/api'
        servername = json.loads(self.request.body)['Server_Name']

        r = requests.delete(api_url + '/users/' + servername + '/server',
            headers={
                'Authorization': f'token 8e88796a4e5e457ba341bee9c845ee6b',
            },
        )
        r.raise_for_status()

def main():
    args = parse_arguments()
    application = create_application(**vars(args))
    application.listen(args.port)
    IOLoop.current().start()


def parse_arguments():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--api-prefix",
        "-a",
        default=[
                 os.environ.get("JUPYTERHUB_SERVICE_PREFIX", "/") + "cull",
                ],
        help="application API prefix",
    )
    parser.add_argument(
        "--port", "-p", default=8011, help="port for API to listen on", type=int
    )
    return parser.parse_args()

handler_list = [
                IdleCullerHandler
               ]

def create_application(api_prefix=["/","/test"], handler=handler_list, **kwargs):

    return Application([(i,j) for i ,j in zip(api_prefix, handler)])


if __name__ == '__main__':
    main()
