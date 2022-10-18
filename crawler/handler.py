from datetime import datetime
import logging
import boto3

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
args = {'region_name': 'us-east-1'}
client = boto3.client('efs', **args)
dataSync = boto3.client('datasync', **args)
NOW = datetime.now()
EFS_ARN = "arn:aws:elasticfilesystem:us-east-1:784579398270:file-system/fs-046eafe8ccd352be9"
ACP_ARN = "arn:aws:elasticfilesystem:us-east-1:784579398270:access-point/fsap-066111f32dd26ec79"
ROL_ARN = "arn:aws:iam::784579398270:role/lambda+efs@full_access"
SUB_ARNS = [
    'arn:aws:ec2:us-east-1:784579398270:subnet/subnet-03fc33596c3e2a196',
    'arn:aws:ec2:us-east-1:784579398270:subnet/subnet-079319ca7cf6872c4',
    'arn:aws:ec2:us-east-1:784579398270:subnet/subnet-01f5b567de825bc80',
    'arn:aws:ec2:us-east-1:784579398270:subnet/subnet-09fdd6bb0fffc4c27',
    'arn:aws:ec2:us-east-1:784579398270:subnet/subnet-0a1846a219d6e6a31',
    'arn:aws:ec2:us-east-1:784579398270:subnet/subnet-0db586241dd71ab29',
]
SEC_ARN = ['arn:aws:ec2:us-east-1:784579398270:security-group/sg-0b8f13f1c916d203c']


def run(event, context):
    dataSync.create_location_efs(
        EfsFilesystemArn=EFS_ARN,
        Subdirectory='/mnt/efs',
        Ec2Config={
            'SubnetArn': SUB_ARNS[0],
            'SecurityGroupArns': SEC_ARN
        },
        # AccessPointArn=ACP_ARN,
        # FileSystemAccessRoleArn=ROL_ARN,
        # InTransitEncryption='TLS1_2'
    )
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
