import logging
import os
from os import environ
from os.path import join as join_path
from os.path import realpath

import boto3
import numpy as np
import pandas as pd

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)


def global_clean_up(global_path):
    """
    Parameters
    ----------
    global_path :  str | PathLike[str] | ReadCsvBuffer[bytes] | ReadCsvBuffer[str]
        Path to the global chart csv file.
    """
    global_chart = pd.read_csv(
        global_path, usecols=["month", "artist", "producer", "album", "title"]
    )
    try:
        global_chart = global_chart.astype(
            {
                "month": "int32",
                "artist": "string",
                "producer": "string",
                "album": "string",
                "title": "string",
            },
            errors="raise",
        )
        global_chart["artist"] = global_chart["artist"].str.split(pat="|", n=1).str[0]
        global_chart = global_chart.drop_duplicates(
            subset=["artist", "producer"], keep="first"
        )
        global_chart = global_chart.astype({"artist": "string"}, errors="raise")
        logger.info(global_chart.head())
        return global_chart
    except Exception as e:
        logger.exception(e)


def album_clean_up(albums_path):
    """
    Parameters
    ----------
    albums_path :  str | PathLike[str] | ReadCsvBuffer[bytes] | ReadCsvBuffer[str]
        Path to the album chart csv file.

    Returns
    -------
    df : pandas.DataFrame
        clean up album chart
    """
    album_chart = pd.read_csv(
        albums_path, usecols=["month", "artist", "sales_volume", "album"]
    )
    try:
        album_chart = album_chart.astype(
            {"month": "int32", "artist": "string", "album": "string"}, errors="raise"
        )
        album_chart[["monthly_sales", "annual_sales"]] = album_chart[
            "sales_volume"
        ].str.split(pat="/", n=1, expand=True)
        album_chart = album_chart.astype(
            {"monthly_sales": "int32", "annual_sales": "int32"}, errors="raise"
        )
        album_chart = album_chart.drop(columns=["sales_volume"]).drop_duplicates(
            ["artist", "month"]
        )
        # Caution: Some artists has multiple agencies that has changed
        album_chart = album_chart.reindex(
            columns=["month", "album", "artist", "monthly_sales", "annual_sales"]
        )
        album_chart = album_chart.sort_values(by=["month", "monthly_sales"])
        logger.info(album_chart.head())
        return album_chart
    except Exception as e:
        logger.exception(e)


def merge_sales_with_producer(global_chart, albums_chart):
    """
    Parameters
    ----------
    global_chart : pd.DataFrame
        Data frame of global chart
    albums_chart : pd.DataFrame
        Data frame of album chart

    Returns
    -------
    new_sales : pd.DataFrame
    """
    new_sales = pd.merge(
        left=albums_chart, right=global_chart, how="outer", on="artist"
    )
    new_sales["month_y"] = new_sales["month_y"].fillna(1800)
    new_sales["producer"] = new_sales["producer"].fillna("미상")
    new_sales = new_sales.astype(
        {"month_y": "int32", "artist": "string", "producer": "string"}, errors="raise"
    )
    # find the producer artist belonged to before the release of the album
    new_sales = new_sales.sort_values("month_y", ascending=True).drop_duplicates(
        ["artist", "month_x"]
    )
    new_sales.rename(columns={"month_x": "month", "album_x": "album"}, inplace=True)
    new_sales = new_sales.drop(columns=["month_y", "album_y", "title"])
    new_sales = new_sales.reindex(
        columns=[
            "month",
            "album",
            "artist",
            "producer",
            "monthly_sales",
            "annual_sales",
        ]
    )
    new_sales = new_sales.sort_values(by=["month", "monthly_sales"])
    new_sales = new_sales.dropna(axis="index")
    new_sales = new_sales.astype(
        {"month": "int32", "annual_sales": "int32", "monthly_sales": "int32"},
        errors="raise",
    )
    logger.info(new_sales.head())
    return new_sales


def pivot_data(new_sales):
    """
    Create a pivot table from our sales dataset. We define the following parameters:
        - values: the column we want to aggregate
        - index: the columns we want to use to define the rows
        - columns: the columns we want to use to define the columns
        - aggfunc: the aggregation function we want to use
    2. We fill the empty cells with a 0.
    3. We log the first 5 rows of the pivot table.

    Parameters
    ----------
    new_sales : pd.DataFrame
        Data frame of sales with producer, artist, album.

    Returns
    -------
    pivot_df : pd.DataFrame
        Pivot table of sales with producer, artist, album.
    """
    pivot_df = pd.pivot_table(
        new_sales,
        values="monthly_sales",
        index=["producer", "artist", "album"],
        columns="month",
        aggfunc=np.sum,
    ).fillna(0)
    logger.info(pivot_df.head())
    return pivot_df


def save_to_excel(sales_table, new_sales, sales, producer, result_path):
    """
    We create a dictionary with our data frames as values and sheet names as keys.
    Then we use the context manager pd.ExcelWriter to create an ExcelWriter object.
    The ExcelWriter object is a context manager that will automatically close the Excel file when the block is exited.
    We then use the data frames to write the data to the Excel file.

    Parameters
    ----------
    sales_table : pd.DataFrame
        clean up sales table.
    new_sales : pd.DataFrame
        pivot table of sales with producer.
    sales : pd.DataFrame
        raw sales table.
    producer : pd.DataFrame
        raw producer table.
    result_path : str | PathLike[str] | WriteExcelBuffer | ExcelWriter,
        canonical path of the specified filename, eliminating.
    """
    data_frames = {
        "cleanup": sales_table,
        "sales_with_producer": new_sales,
        "raw_sales": sales,
        "raw_producer": producer,
    }
    # Create a Pandas Excel writer using XlsxWriter as the engine.
    with pd.ExcelWriter(result_path, engine="xlsxwriter") as writer:
        for sheet_name, data_frame in data_frames.items():
            data_frame.to_excel(writer, sheet_name=sheet_name)


def chart_processor():
    EFS_PATH = environ.get("EFS_PATH", "./data/")
    TMP_PATH = environ.get("TMP_PATH", "./data/")
    GLOBAL = realpath(join_path(TMP_PATH, "global_kpop_chart.csv"))
    ALBUMS = realpath(join_path(TMP_PATH, "album_chart.csv"))
    RESULT = realpath(join_path(EFS_PATH, "global_kpop_chart_cleanup.xlsx"))
    paths = [os.curdir, os.pardir]
    for _, dirNames, filenames in os.walk(EFS_PATH):
        for d in dirNames:
            paths.append(d + "/")
        paths.extend(filenames)
    logger.info("    ".join(paths))
    try:
        _globals = global_clean_up(GLOBAL)
        _albums = album_clean_up(ALBUMS)
        _new_sales = merge_sales_with_producer(_globals, _albums)
        _sales_table = pivot_data(_new_sales)
        save_to_excel(_sales_table, _new_sales, _globals, _albums, RESULT)
        S3 = boto3.client("s3")
        for bucket in S3.list_buckets()["Buckets"]:
            if bucket["Name"].startswith("get-chart-"):
                S3.upload_file(
                    Filename="global_kpop_chart_cleanup.xlsx",
                    Bucket=bucket["Name"],
                    Key="serverless/get-chart/efs/",
                )
    except Exception as e:
        logger.exception(e)


if __name__ == "__main__":
    chart_processor()
