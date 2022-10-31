import requests
import os
from urllib.parse import quote
from dotenv import load_dotenv

load_dotenv()
bearer_token = os.environ.get("BEARER_TOKEN")


def create_url(query: str, service: str):
    if service == "get-user-id":
        path = f"by/username/{quote(query)}"
    if service == "user":
        path = f"by/?usernames=TwitterDev,TwitterAPI&user.fields=description,created_at"
    elif service == "followers":
        path = f"{query}?user.fields=public_metrics"
    url = f"https://api.twitter.com/2/users/{path}"
    return url


def bearer_oauth(r):
    """
    Method required by bearer token authentication.
    """
    r.headers["Authorization"] = f"Bearer {bearer_token}"
    r.headers["User-Agent"] = "v2UserLookupPython"
    return r


def connect_to_endpoint(url):
    response = requests.request("GET", url, auth=bearer_oauth)
    if response.status_code != 200:
        raise Exception(
            "Request returned an error: {} {}".format(
                response.status_code, response.text
            )
        )
    return response.json()


def change_to_id(twitter_name):
    url = create_url(twitter_name, "get-user-id")
    json_response = connect_to_endpoint(url)
    try:
        return json_response["data"]["id"]
    except KeyError:
        print(json_response)
    except TypeError:
        print(json_response)


def get_public_metrics(twitter_id):
    url = create_url(twitter_id, "followers")
    json_response = connect_to_endpoint(url)
    try:
        return json_response["data"]["public_metrics"]
    except KeyError:
        print(json_response)
    except TypeError:
        print(json_response)
