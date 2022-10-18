from datetime import datetime
import logging
import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
client = boto3.client('efs')
NOW = datetime.now()


def run(event, context):
    current_time = NOW.time()
    name = context.function_name
    logger.info("Your cron function " + name + " ran at " + str(current_time))
    file_systems = list_file_systems()
    for fs in file_systems:
        mt = list_mount_targets(fs)
        for target in mt:
            print(target)
    return file_systems


def list_file_systems() -> list:
    try:
        # describe all file systems
        response = client.describe_file_systems()
        print(response)
        # parse and return file system ids from above response
        return [file_system['FileSystemId'] for file_system in response['FileSystems']]
    except Exception as error:
        print("Error on list_file_systems")
        logger.info(error)
        exit(1)


def list_mount_targets(file_system: str) -> list:
    try:
        response = client.describe_mount_targets(FileSystemId=file_system)
        print(response)
        return [mount_target['MountTargetId'] for mount_target in response['MountTargets']]
    except Exception as error:
        print("Error on list_mount_targets")
        logger.info(error)
        exit(1)


def delete_mount_targets(mount_targets: list) -> bool:
    try:
        for mount_target in mount_targets:
            client.delete_mount_target(MountTargetId=mount_target)
        return True
    except Exception as error:
        print("Error on delete_mount_targets")
        print(error)
        exit(1)


def delete_file_systems(file_systems: list) -> bool:
    try:
        # delete file systems
        for file_system in file_systems:
            mount_targets = list_mount_targets(file_system)
            delete_mount_targets(mount_targets)
            # need for waiter delete target mounts
            client.delete_file_system(FileSystemId=file_system)
        # return successfully code, if done
        return True
    except Exception as error:
        print("Error on delete_file_systems")
        logger.info(error)
        exit(1)


def lambda_handler(event, context):
    file_systems = list_file_systems()
    for fs in file_systems:
        mt = list_mount_targets(fs)
        for target in mt:
            print(target)
    logger.info(event)
    return file_systems


if __name__ == '__main__':
    run({}, "event")