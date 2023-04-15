import {
  AnnotationColor,
  Annotations,
  ArrayElement,
  SelectColor,
  TextRichTextItem,
} from "./types/notion.types";
import { AxiosError, AxiosInstance, AxiosResponse, ResponseType } from "axios";
import {
  CompleteMultipartUploadCommandOutput,
  S3Client,
} from "@aws-sdk/client-s3";
import {
  MultiSelect,
  NotionFile,
  NotionSelect,
  NotionText,
  NotionTitle,
  NotionURL,
  Numeric,
  RichText,
  SelectRequest,
} from "./types/notion.types";
import { PassThrough, Readable } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { assert } from "console";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

export const removeCom = (str: string): string =>
  str
    .replace(",", " ")
    .replace("/", " ")
    .replace(/\s{2,}/, " ")
    .trim();

export const removeComma = (str: string[]): string[] => {
  const newArray: string[] = [];
  str.forEach((value: string) => {
    if (!value.includes("(") && !value.includes(")")) {
      if (value.includes(",")) {
        value.split(",").forEach((v) => v && newArray.push(v.trim()));
      } else if (value.includes("/")) {
        value.split("/").forEach((v) => v && newArray.push(v.trim()));
      } else {
        value && newArray.push(removeCom(value));
      }
    }
  });
  return newArray;
};

export const removeQuery = (urlString: string): URL["href"] => {
  const preUrl = new URL(urlString);
  const curUrl = new URL(preUrl.pathname, preUrl.origin);
  return decodeURIComponent(curUrl.href);
};

export const delay = (ms: number): Promise<never> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const isEmpty = (thing?: unknown[]): boolean =>
  !thing || (thing && !thing.length);

const urlRegExp =
  /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;

const list = (txt: string, separate?: string) => {
  if (separate) {
    return txt.split(separate).map((t) => t && t.trim());
  } else {
    const result: RegExpMatchArray | string[] =
      txt.match(/([^\n\t\r]){1,100}/g) ?? [];
    if (result.length) return result;
    for (let i = 0; i < txt.length; i += 100)
      result.push(txt.slice(i, i + 100));
    return result;
  }
};

export const toNumber = (number: number): Numeric => {
  return { number };
};

export const toURL = (urlString: string): NotionURL => {
  const url = new URL(urlString).href;
  return { url };
};

const toRichText = (
  content: string,
  href: string | null,
  color?: AnnotationColor
): TextRichTextItem => {
  const rich_text: TextRichTextItem = {
    text: toText(content, href),
    annotations: toAnnotations(color),
    plain_text: content,
    href: href ?? content.match(urlRegExp)?.[0] ?? null,
  };
  return rich_text;
};

export const richText = (contents: string, href?: string | null): RichText => {
  const rich_text = list(contents, undefined).map((txt) => {
    if (!href) href = txt.match(urlRegExp)?.[0] ?? null;
    return toRichText(txt, href);
  });
  return { rich_text };
};

export const multiSelect = (contents: string[]): MultiSelect => {
  const multi_select: SelectRequest[] = [];
  contents.forEach((txt) => {
    const select = toSelect(txt);
    multi_select.push(select.select);
  });
  return { multi_select };
};

export const toTitle = (content: string, href?: string): NotionTitle => {
  const title: TextRichTextItem[] = [content].map((cnt) =>
    toRichText(cnt, href ?? "")
  );
  return { title };
};

export const toSelect = (name: string, color?: SelectColor): NotionSelect => {
  const select = { name: name.replace(/,+/, ""), color };
  return { select };
};

export const toAnnotations = (color?: AnnotationColor): Annotations => {
  return {
    bold: false,
    italic: false,
    strikethrough: false,
    underline: false,
    code: false,
    color: color ?? "default",
  };
};

export const toText = (content: string, href: string | null): NotionText => {
  return {
    content,
    link: href !== null ? { url: href } : href,
  };
};

export const toImage = (
  url: string,
  index: number,
  company_name: string
): ArrayElement<NotionFile["files"]> => {
  const name = `${company_name}_${index}`;
  const type = "external";
  return { name, type, external: { url } };
};

export const thumbnails = (
  company_images: (string | { url: string })[],
  company_name: string
): NotionFile => {
  const files = company_images.map((img, i: number) => {
    if (typeof img === "object" && "url" in img) {
      return toImage(img.url, i, company_name);
    } else {
      assert(typeof img === "string");
      return toImage(img, i, company_name);
    }
  });
  return { files };
};

export async function downloadImage(
  axios: AxiosInstance,
  url: string,
  company_name?: string,
  index?: number
) {
  const getFilename = (url: string) => {
    let filename = removeQuery(url).split("/").pop() as string;
    let ext = filename.split(".").pop() as string;
    ext = ext.toLowerCase();
    if (index) company_name = `${company_name}_${index}`;
    if (company_name) filename = `${company_name}.${ext}`;
    return { filename, ext };
  };
  const responseType: ResponseType = "stream";
  return await axios
    .get<Readable, AxiosResponse<Readable>>(url, { responseType })
    .then(
      async (response: AxiosResponse<Readable>) => {
        const contentType = response.headers["content-type"];
        const Body: Readable = response.data;
        const { filename: Key, ext: Extension } = getFilename(url);
        const filename = `./images/${Key}`;
        if (contentType && contentType.startsWith("image")) {
          // console.debug("🚀file:notion.utils.ts:199 > contentType", contentType);
          // const decodedUrl = decodeURIComponent(url);
          // console.debug("🚀file:notion.utils.ts:201 > decodedUrl", decodedUrl);
        }
        switch (process.env["NODE_ENV"]) {
          case "dev": {
            // static 다운로드
            const fileWriter = fs.createWriteStream(filename);
            Body.pipe(fileWriter);
            const filePath = decodeURIComponent(filename);
            // console.debug('🚀file:notion.utils.ts:209 > filePath', filePath);
            return filePath;
          }
          case "prod": {
            // S3 업로드
            const Bucket = process.env["S3_IMAGE_BUCKET"] ?? "";
            const client: S3Client = new S3Client({
              region: process.env["AWS_REGION"] ?? "",
              credentials: {
                accessKeyId: process.env["AWS_ACCESS_KEY_ID"] ?? "",
                secretAccessKey: process.env["AWS_SECRET_ACCESS_KEY"] ?? "",
              },
            });
            const uploaded = new Upload({
              client,
              params: {
                Key,
                Bucket,
                Body: Body,
                ACL: "public-read",
              },
            });
            const completed: CompleteMultipartUploadCommandOutput =
              await uploaded.done();
            const location = completed.Location;
            if (location === undefined) {
              process.exit(1);
            }
            // console.debug('🚀file:notion.utils.ts:236 > newLocation', newLocation);
            return decodeURIComponent(location);
          }
          case "test": {
            // base64 문자열 변환
            const encoding = "base64";
            const chunks = new PassThrough({ encoding });
            Body.pipe(chunks);
            let Content = "";
            for await (const chunk of chunks) {
              Content += chunk;
            }
            const base64String = `data:image/${Extension};base64,${Content}`;
            return base64String;
          }
          default:
            return;
        }
      },
      (reason: AxiosError) => {
        console.debug("🚀file:notion.utils.ts:256 > reason", reason.message);
      }
    );
}
