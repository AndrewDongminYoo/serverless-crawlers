import os
import json
import boto3
import logging
from datetime import datetime
from api import main as fetch_api_data
from browser import main as crawl_browser_data

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
EFS = boto3.client('efs')
LAMBDA = boto3.client('lambda')
NOW = datetime.now()
TIME_FMT = "%Y-%m-%dT%H:%M:%SZ"
EFS_PATH = "/mnt/efs/"
DESTINATION = 'circle-chart-dev-csvMerger'
TAB = chr(0x09)


def run(event, context):
    paths = [os.curdir, os.pardir]
    for (_, dirNames, filenames) in os.walk(EFS_PATH):
        for d in dirNames:
            paths.append(d+"/")
        paths.extend(filenames)
    logger.info(TAB.join(paths))
    logger.info(f"id = {os.getuid()}")
    logger.info(f"gid = {os.getgid()}")
    date_object = datetime.strptime(event["time"], TIME_FMT)
    if date_object.weekday() == 3 and date_object.hour == 1:
        cron()
    else:
        delete()
        main()
    args = {
        'FunctionName': DESTINATION,
        'InvokeArgs': '{}',
    }
    LAMBDA.invoke_async(**args)
    return paths


def delete():
    for filename in os.listdir(EFS_PATH):
        file_path = os.path.join(EFS_PATH, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.remove(file_path)
            elif os.path.isdir(file_path):
                os.rmdir(file_path)
        except Exception as e:
            logger.exception('Failed to delete %s. Reason: %s' % (file_path, e))


def main():
    try:
        fetch_api_data("w")
    except Exception as e:
        print(e)
        logger.error(e)
        crawl_browser_data("w")


def cron():
    try:
        fetch_api_data("a")
    except Exception as e:
        print(e)
        logger.error(e)
        crawl_browser_data("a")


if __name__ == '__main__':
    _event = json.load(open("./event.json", mode="r"))
    _context = json.load(open("./context.json", mode="r"))
    run(_event, _context)
