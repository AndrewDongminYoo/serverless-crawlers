import requests
from bs4 import BeautifulSoup

headers = dict()
headers[
    "Accept"
] = "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9"
headers["Accept-language"] = "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7"
headers["Accept-encoding"] = "gzip, deflate, br"
headers["Cache-control"] = "max-age=0"
headers["Referer"] = "https://socialblade.com/youtube/user/youtube/monthly"
headers[
    "Sec-ch-ua"
] = '"Google Chrome";v="107", "Chromium";v="107", "Not=A?Brand";v="24"'
headers["Sec-ch-ua-mobile"] = "?0"
headers["Sec-ch-ua-platform"] = '"macOS"'
headers["Sec-fetch-dest"] = "document"
headers["Sec-fetch-mode"] = "navigate"
headers["Sec-fetch-site"] = "none"
headers["Sec-fetch-user"] = "?1"
headers["Upgrade-insecure-requests"] = "1"
headers[
    "User-Agent"
] = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/107.0.0.0 Safari/537.36"


def get_total_view_count(youtube_url):
    req = requests.get(youtube_url, headers=headers)
    soup = BeautifulSoup(req.text, "html.parser")
    params = [
        "views",
        "uploads",
        "subs",
        "country",
        "channeltype",
    ]
    result = {i: None for i in params}
    try:
        for param in result.keys():
            element = soup.select_one(f"youtube-stats-header-{param}")
            result[param] = element.text
    except Exception as e:
        print(e)
    return result
