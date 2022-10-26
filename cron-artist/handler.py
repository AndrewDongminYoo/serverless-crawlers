import logging
import json
import pandas as pd
from search import youtube_query

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def run(event, context=None):
    df = pd.read_csv("./youtube.csv", encoding="utf-8", usecols=["entertainment","Artist","URL"])
    for i, artist in df.iterrows():
        query = artist["Artist"]
        if artist.isna()["URL"]:
            youtube_query(query)


if __name__ == '__main__':
    _event = json.load(open("./event.json", mode="r"))
    run(_event)
