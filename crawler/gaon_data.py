from pathlib import Path
import pandas as pd
import numpy as np
import logging
import json
import boto3
import os

# Get sales data from raw gaon chart data

logger = logging.getLogger()
EFS_PATH = "/mnt/efs/"
GLOBAL = Path("/mnt/efs/global_kpop_chart.csv")
ALBUMS = Path("/mnt/efs/album_chart.csv")
RESULT = Path("/mnt/efs/global_kpop_chart_cleanup.xlsx")
result_file = open(RESULT, 'a+')


def global_clean_up():
    global_chart = pd.read_csv(GLOBAL, usecols=['month', 'artist', 'producer', 'album', 'title'])
    try:
        global_chart = global_chart.astype({
            'month': 'int32',
            'artist': 'string',
            'producer': 'string',
            'album': 'string',
            'title': 'string'
        }, errors='raise')
        global_chart['artist'] = global_chart['artist'].str.split(pat='|', n=1).str[0]
        global_chart = global_chart.drop_duplicates(subset=['artist', 'producer'], keep='first')
        global_chart = global_chart.astype({'artist': 'string'}, errors='raise')
        return global_chart
    except Exception as e:
        logger.exception(e)


def album_clean_up():
    album_chart = pd.read_csv(ALBUMS, usecols=['month', 'artist', 'sales_volume', 'album'])
    try:
        album_chart = album_chart.astype({'month': 'int32', 'artist': 'string', 'album': 'string'}, errors='raise')
        album_chart[['monthly_sales', 'annual_sales']] = album_chart['sales_volume'].str.split(pat='/', n=1, expand=True)
        album_chart = album_chart.astype({'monthly_sales': 'int32', 'annual_sales': 'int32'}, errors='raise')
        album_chart = album_chart.drop(columns=['sales_volume']).drop_duplicates(['artist', 'month'])
        # Caution: Some artists has multiple agencies that has changed
        album_chart = album_chart.reindex(columns=['month', 'album', 'artist', 'monthly_sales', 'annual_sales'])
        album_chart = album_chart.sort_values(by=['month', 'monthly_sales'])
        return album_chart
    except Exception as e:
        logger.exception(e)


def merge_sales_with_producer(global_chart: pd.DataFrame, album_chart: pd.DataFrame):
    new_sales = pd.merge(left=album_chart, right=global_chart, how='outer', on='artist')
    new_sales['month_y'] = new_sales['month_y'].fillna(1800)
    new_sales['producer'] = new_sales['producer'].fillna('미상')
    new_sales = new_sales.astype({'month_y': 'int32', 'artist': 'string', 'producer': 'string'}, errors='raise')
    # find the producer artist belonged to before the release of the album
    new_sales = new_sales.sort_values('month_y', ascending=True).drop_duplicates(['artist', 'month_x'])
    new_sales.rename(columns={'month_x': 'month', 'album_x': 'album'}, inplace=True)
    new_sales = new_sales.drop(columns=['month_y', 'album_y', 'title'])
    new_sales = new_sales.reindex(columns=['month', 'album', 'artist', 'producer', 'monthly_sales', 'annual_sales'])
    new_sales = new_sales.sort_values(by=['month', 'monthly_sales'])
    new_sales = new_sales.dropna(axis="index")
    new_sales = new_sales.astype({'month': 'int32', 'annual_sales': 'int32', 'monthly_sales': 'int32'}, errors='raise')
    logger.info(new_sales.head())
    return new_sales


def pivot_data(new_sales: pd.DataFrame):
    pivot_df = pd.pivot_table(
        new_sales,
        values="monthly_sales",
        index=['producer', 'artist', 'album'],
        columns="month",
        aggfunc=np.sum
    ).fillna(0)
    logger.info(pivot_df.head())
    return pivot_df


def save_to_excel(sales_table: pd.DataFrame, new_sales: pd.DataFrame, sales: pd.DataFrame, producer: pd.DataFrame):
    data_frames = {
        'cleanup': sales_table,
        'sales_with_producer': new_sales,
        'raw_sales': sales,
        'raw_producer': producer,
    }
    # Create a Pandas Excel writer using XlsxWriter as the engine.
    with pd.ExcelWriter(result_file, engine='xlsxwriter') as writer:
        for sheet_name, data_frame in data_frames.items():
            data_frame.to_excel(writer, sheet_name=sheet_name)


def lambda_handler(event, context):
    EFS = boto3.client("efs")
    paths = [os.curdir, os.pardir]
    for (_, dirNames, filenames) in os.walk(EFS_PATH):
        for d in dirNames:
            paths.append(d + "/")
        paths.extend(filenames)
    logger.info("    ".join(paths))
    try:
        _globals = global_clean_up()
        _albums = album_clean_up()
        _new_sales = merge_sales_with_producer(_globals, _albums)
        _sales_table = pivot_data(_new_sales)
        save_to_excel(_sales_table, _new_sales, _globals, _albums)
        EFS.close()
        return True
    except Exception as e:
        logger.exception(e)
        return False


if __name__ == '__main__':
    _event = json.load(open("./event.json", mode="r"))
    _context = json.load(open("./context.json", mode="r"))
    lambda_handler(_event, _context)
