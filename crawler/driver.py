from selenium.webdriver import Chrome
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver import ChromeOptions
import os


def get_driver():
    try:
        paths = set(os.environ["PATH"].split(':'))
        for (root, dirName, fileName) in os.walk("/"):
            for f in fileName:
                if "chrom" in f:
                    paths.add(root)
        driver_path = ChromeDriverManager().install()
        options = ChromeOptions()
        arguments = [
            # '--allow-running-insecure-content',
            '--disable-dev-shm-usage',
            # '--disable-extensions',
            # '--disable-gpu',
            # '--disable-infobars',
            # '--disable-popup-blocking',
            # '--disable-web-security',
            # '--enable-logging',
            '--headless',
            # '--hide-scrollbars',
            # '--ignore-certificate-errors',
            '--no-sandbox',
            # '--single-process',
            # '--start-maximized',
            pair('--data-path', '/tmp/data-path'),
            pair('--disk-cache-dir', '/tmp/cache-dir'),
            pair('--homedir', '/tmp'),
            pair('--log-level', 0),
            pair('--user-data-dir', '/tmp/user-data'),
            pair('--v', 99),
            pair('--window-size', '1280x1696'),
            pair('user-agent', USER_AGENT)
        ]
        options.arguments.extend(arguments)
        options.binary_location = driver_path
        service = Service(executable_path=driver_path)
        paths.add(options.binary_location)
        os.environ["PATH"] = ":".join(paths)
        log_path = '/tmp/chromedriver.log'
        driver = Chrome(service=service, options=options, service_log_path=log_path)
        return driver
    except Exception as e:
        print(e)
        raise e


def pair(key: str, value): return f"{key}={value}"


USER_AGENT = ' '.join([
    'Mozilla/5.0', '(Macintosh; Intel Mac OS X 10_15_7)',
    'AppleWebKit/537.36', '(KHTML, like Gecko)',
    'Chrome/106.0.0.0', 'Safari/537.36'
])