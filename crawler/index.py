from crawler.api import main as fetch_api_data
from crawler.browser import main as crawl_browser_data
from crawler.gaon_data import main as reformat_data


if __name__ == '__main__':
    try:
        fetch_api_data("all")
    except Exception as e:
        crawl_browser_data("all")
        print(e)
    reformat_data()
