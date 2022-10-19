try:
  import unzip_requirements
except ImportError:
  pass

from datetime import datetime
import logging
import boto3
import os
from api import main as fetch_api_data
from browser import main as crawl_browser_data
from gaon_data import main as reformat_data


logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
efs = boto3.client('efs')
NOW = datetime.now()


def run(event, context):
    logger.info(f"Client: {efs}")
    logger.info(f"ls: {','.join(os.listdir('/'))}")
    logger.info(f"GID: {os.getgid()}")
    logger.info(f"UID: {os.getuid()}")
    logger.info(f"EUID: {os.geteuid()}")

    response = efs.describe_file_systems()
    logger.info(response)
    # parse and return file system ids from above response
    file_systems = [file_system['FileSystemId'] for file_system in response['FileSystems']]
    logger.info(file_systems)
    for fs in file_systems:
        response = efs.describe_mount_targets(FileSystemId=fs)
        mounts = [mount_target['MountTargetId'] for mount_target in response['MountTargets']]
        logger.info(mounts)
        for target in mounts:
            logger.info(target)
    main()
    return file_systems


def main():
    try:
        fetch_api_data("w")
    except Exception as e:
        crawl_browser_data("w")
        logger.debug(e)
    reformat_data()


def cron():
    try:
        fetch_api_data("a")
    except Exception as e:
        crawl_browser_data("a")
        logger.debug(e)
