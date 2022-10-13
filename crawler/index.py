from crawler.api import main as fetch_api_data
from crawler.browser import main as crawl_browser_data
from crawler.gaon_data import main as reformat_data


def main():
    try:
        fetch_api_data("w")
    except Exception as e:
        crawl_browser_data("w")
        print(e)
    reformat_data()


def cron():
    try:
        fetch_api_data("a")
    except Exception as e:
        crawl_browser_data("a")
        print(e)


if __name__ == '__main__':
    main()
