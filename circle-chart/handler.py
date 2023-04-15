import json
import logging
import os
from datetime import datetime

from api import fetch_api_data
from browser import crawl_browser_data
from common import EFS_PATH, TMP_PATH
from dotenv import load_dotenv
from gaon_data import chart_processor

load_dotenv()
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
NOW = datetime.now()
TIME_FMT = "%Y-%m-%dT%H:%M:%SZ"
TAB = chr(0x09)


def run(event, _context=None):
    paths = [os.curdir, os.pardir]
    for _, dirNames, filenames in os.walk(EFS_PATH):
        for d in dirNames:
            paths.append(d + "/")
        paths.extend(filenames)
    logger.info(f"EFS PATH: {TAB.join(paths)}")
    paths = [os.curdir, os.pardir]
    for _, dirNames, filenames in os.walk(TMP_PATH):
        for d in dirNames:
            paths.append(d + "/")
        paths.extend(filenames)
    logger.info(f"TMP PATH: {TAB.join(paths)}")
    logger.info(f"id = {os.getuid()}")
    logger.info(f"gid = {os.getgid()}")
    try:
        date_object = datetime.strptime(event["time"], TIME_FMT)
    except TypeError as e:
        logger.error(e)
        date_object = NOW
    if date_object.weekday() == 3 and date_object.hour == 1:
        cron()
    else:
        delete()
        main()
    chart_processor()


def delete():
    for filename in os.listdir(EFS_PATH):
        file_path = os.path.join(EFS_PATH, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.remove(file_path)
            elif os.path.isdir(file_path):
                os.rmdir(file_path)
        except Exception as e:
            logger.exception("Failed to delete %s. Reason: %s" % (file_path, e))


def main():
    try:
        fetch_api_data("w")
    except Exception as e:
        logger.error(e)
        crawl_browser_data("w")


def cron():
    try:
        fetch_api_data("a")
    except Exception as e:
        logger.error(e)
        crawl_browser_data("a")


if __name__ == "__main__":
    _event = json.load(open("./event.json", mode="r"))
    run(_event)
