import logging
import os
from datetime import datetime

import boto3
import pandas as pd
from dotenv import load_dotenv
from twitter import change_to_id, get_public_metrics
from youtube import youtube_query

pd.set_option("styler.format.thousands", ",")
load_dotenv()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
S3 = boto3.client("s3")
TMP_PATH = os.environ.get("TMP_PATH", os.curdir)
INPUT_DF = os.path.join(TMP_PATH, "entertainment.csv")


def load_csv(use_cols=None):
    if not os.path.exists("entertainment.csv"):
        S3.download_file(
            Bucket=os.environ["AWS_S3_BUCKET"],
            Key="entertainment.csv",
            Filename=INPUT_DF,
        )
        logger.info(
            f'downloaded file from {os.environ["AWS_S3_BUCKET"]}/entertainment.csv to /tmp/ folder'
        )
    if use_cols:
        return pd.read_csv(INPUT_DF, encoding="utf-8", usecols=use_cols, dtype="str")
    else:
        use_cols = [
            "company",
            "artist",
            "YOUTUBE_URL",
            "TWITTER_URL",
            "bladeYoutube",
            "bladeTwitter",
            "TWITTER_ID",
            "TWITTER_NAME",
        ]
        return pd.read_csv(INPUT_DF, encoding="utf-8", usecols=use_cols, dtype="str")


def save_to_s3(table: pd.DataFrame, file_name):
    fmt = "%y%m%d"
    name, ext = file_name.rsplit(".", 1)
    OUTPUT_DF = os.path.join(TMP_PATH, file_name)
    if ext == "csv":
        table.to_csv(OUTPUT_DF, encoding="utf-8", index=False)
        S3.upload_file(
            Bucket=os.environ["AWS_S3_BUCKET"], Key=file_name, Filename=OUTPUT_DF
        )
    elif ext == "xlsx":
        today = datetime.today().strftime(fmt)
        file_name = f"{name}_{today}.{ext}"
        table.to_excel(OUTPUT_DF, engine="xlsxwriter")
        S3.upload_file(
            Bucket=os.environ["AWS_S3_BUCKET"],
            Key=f"output/{file_name}",
            Filename=OUTPUT_DF,
        )
    logger.info(
        f'uploaded file to {os.environ["AWS_S3_BUCKET"]}/output/{file_name} from /tmp/ folder'
    )
    os.remove(OUTPUT_DF)


def fill_twitter_id():
    df = load_csv()
    for i, artist in df.iterrows():
        twitter_account = artist["TWITTER_NAME"]
        df.loc[i, "TWITTER_ID"] = change_to_id(twitter_account)
    save_to_s3(df, "entertainment.csv")


def fill_youtube_url():
    df = load_csv()
    for _i, artist in df.iterrows():
        query = artist["artist"]
        if artist.isna()["YOUTUBE_URL"]:
            channel_id = youtube_query(query, "channel_id")
            if channel_id:
                artist["YOUTUBE_URL"] = f"https://www.youtube.com/channel/{channel_id}"
    save_to_s3(df, "entertainment.csv")


def fill_twitter_statistics():
    df = load_csv()
    df["t_followers"] = None
    df["t_following"] = None
    df["t_tweets"] = None
    for i, artist in df.iterrows():
        twt_id = artist["TWITTER_ID"]
        statistics = get_public_metrics(twt_id)
        df.loc[i, "t_followers"] = large_num(statistics["followers_count"])
        df.loc[i, "t_following"] = statistics["following_count"]
        df.loc[i, "t_tweets"] = statistics["tweet_count"]
    df = df.astype(
        {
            "t_followers": "string",
            "t_following": "int64",
            "t_tweets": "int64",
        },
        errors="ignore",
    )
    save_to_s3(df, "twitter.xlsx")


def fill_youtube_statistics():
    df = load_csv()
    df["y_subscribes"] = None
    df["y_views"] = None
    for i, artist in df.iterrows():
        channel_id = artist["YOUTUBE_URL"].replace(
            "https://www.youtube.com/channel/", ""
        )
        data = youtube_query(channel_id, "list-channels")
        if not data["hiddenSubscriberCount"]:
            df.loc[i, "y_subscribes"] = large_num(data["subscriberCount"])
        df.loc[i, "viewCount"] = int(data["viewCount"])
    df = df[["company", "artist", "y_subscribes", "y_views"]]
    index = pd.MultiIndex.from_frame(
        df[["company", "artist"]], names=("company", "artist")
    )
    df.set_index(index, inplace=True)
    df.drop(["company", "artist"], inplace=True, axis=1)
    df = df.astype({"y_subscribes": "string", "y_views": "int64"}, errors="ignore")
    save_to_s3(df, "youtube.xlsx")


def large_num(number):
    number = int(number)
    if number > 1000000:
        new_num = format(number / 1000 / 1000, ".0f") + "M"
    elif number > 1000:
        new_num = format(number / 1000, ".0f") + "K"
    else:
        new_num = number
    return new_num


def run(event, context):
    fill_twitter_statistics()
    fill_youtube_statistics()


if __name__ == "__main__":
    run(None, None)
