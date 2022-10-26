from apiclient.discovery import build
from apiclient.errors import HttpError
import argparse
from dotenv import load_dotenv
import os
import json

# Set DEVELOPER_KEY to the API key value from the APIs & auth > Registered apps
# tab of
#   https://cloud.google.com/console
# Please ensure that you have enabled the YouTube Data API for your project.
load_dotenv()
DEVELOPER_KEY = os.environ["API_KEY"]
YOUTUBE_API_SERVICE_NAME = "youtube"
YOUTUBE_API_VERSION = "v3"


def youtube_search(options):
    youtube = build(YOUTUBE_API_SERVICE_NAME, YOUTUBE_API_VERSION,
                    developerKey=DEVELOPER_KEY)

    # Call the search.list method to retrieve results matching the specified
    # query term.
    search_response = youtube.search().list(
        q=options.q,
        part="id,snippet",
        maxResults=options.max_results
    ).execute()

    videos = []
    channels = []
    playlists = []

    # Add each result to the appropriate list, and then display the lists of
    # matching videos, channels, and playlists.
    for search_result in search_response.get("items", []):
        if search_result["id"]["kind"] == "youtube#video":
            videos.append(f"{search_result['snippet']['title']} ({search_result['id']['videoId']}) : (채널명 {search_result['snippet']['channelTitle']})")
        elif search_result["id"]["kind"] == "youtube#channel":
            channels.append(f"{search_result['snippet']['title']} ({search_result['id']['channelId']}) : (채널명 {search_result['snippet']['channelTitle']})")
        elif search_result["id"]["kind"] == "youtube#playlist":
            playlists.append(f"{search_result['snippet']['title']} ({search_result['id']['playlistId']}) : (채널명 {search_result['snippet']['channelTitle']})")

    print("Videos:\n", "\n".join(videos))
    print("Channels:\n", "\n".join(channels))
    print("Playlists:\n", "\n".join(playlists))


def youtube_query(query):
    argparser = argparse.ArgumentParser(description="create argument namespace")
    argparser.add_argument("--max-results", help="Max results", default=100)
    argparser.add_argument("--q", help="Search term", default=query)
    args = argparser.parse_args()
    try:
        youtube_search(args)

    except HttpError as e:
        print("An HTTP error %d occurred:\n%s" % (e.resp.status, e.content))


if __name__ == '__main__':
    youtube_query("SMTOWN")
