import argparse
import os

from dotenv import load_dotenv
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

load_dotenv()
DEVELOPER_KEY = os.environ["YOUTUBE_API_KEY"]
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"


def get_youtube_response(options, api_type):
    youtube = build(
        YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION, developerKey=DEVELOPER_KEY
    )
    if api_type == "search":
        return (
            youtube.search()
            .list(q=options.q, part="id,snippet", maxResults=options.max_results)
            .execute()
        )
    elif api_type == "channels":
        return (
            youtube.channels()
            .list(id=options.id, part="statistics", maxResults=options.max_results)
            .execute()
        )


def search_all(options):
    search_response = get_youtube_response(options, "search")
    videos = []
    channels = []
    playlists = []
    for search_result in search_response.get("items", []):
        if search_result["id"]["kind"] == "youtube#video":
            videos.append(
                f"{search_result['snippet']['title']} ({search_result['id']['videoId']}) : (채널명 {search_result['snippet']['channelTitle']})"
            )
        elif search_result["id"]["kind"] == "youtube#channel":
            channels.append(
                f"{search_result['snippet']['title']} ({search_result['id']['channelId']}) : (채널명 {search_result['snippet']['channelTitle']})"
            )
        elif search_result["id"]["kind"] == "youtube#playlist":
            playlists.append(
                f"{search_result['snippet']['title']} ({search_result['id']['playlistId']}) : (채널명 {search_result['snippet']['channelTitle']})"
            )
    return dict(videos=videos, channels=channels, playlists=playlists)


def get_channel_id(options):
    search_response = get_youtube_response(options, "search")
    for search_result in search_response.get("items", []):
        if search_result["id"]["kind"] == "youtube#channel":
            if search_result["snippet"]["title"] == options.q:
                return search_result["snippet"]["channelId"]


def youtube_search(options):
    search_response = get_youtube_response(options, "channels")
    for search_result in search_response.get("items", []):
        if search_result["kind"] == "youtube#channel":
            if search_result["id"] == options.id:
                return search_result["statistics"]


def youtube_query(query, service):
    arg_parser = argparse.ArgumentParser(description="create argument namespace")
    arg_parser.add_argument("--max-results", help="Max results", default=100)
    arg_parser.add_argument("--id", help="Channel Id", default=query)
    arg_parser.add_argument("--q", help="Search term", default=query)
    args = arg_parser.parse_args()
    try:
        if service == "list-channels":
            return youtube_search(args)
        elif service == "channel-id":
            return get_channel_id(args)
        elif service == "search-all":
            return search_all(args)
    except HttpError as e:
        print("An HTTP error %d occurred:\n%s" % (e.resp.status, e.content))
