import { Button, Card, notification, Upload } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { twJoin } from "tailwind-merge";
import papaparse from "papaparse";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import cloneDeep from "lodash-es/cloneDeep";
import { useDeferredValue, useMemo, useState } from "react";
import { FixedSizeList as List } from "react-window";
import flatten from "lodash-es/flatten";
import useResizeObserver from "use-resize-observer";
import { css } from "@emotion/react";
import { downloadTextFile } from "../utils/downloadTextFile";
import Loader from "../components/Loader/Loader";
import VIRTUALIZE_THRESHOLD from "../constants/VIRTUALIZE_THRESHOLD";

dayjs.extend(utc);

type ConsumptionUpdateType = {
  timestamp: string;
  consumption: number;
};

type UpdateType = {
  nim: string;
  interval: number;
  usages: ConsumptionUpdateType[];
};

export default function LandingPage() {
  const [empty] = useState([]);
  const [allUpdates, setAllUpdates] = useState<UpdateType[]>();
  const [isParsing, setIsParsing] = useState(false);

  const {
    ref,
    width = 300,
    height = 300,
  } = useResizeObserver<HTMLDivElement>();

  const allUpdatesDeferred = useDeferredValue(allUpdates);

  const flattenedData = useMemo(() => {
    if (!allUpdatesDeferred) {
      return undefined;
    }

    return flatten(
      allUpdatesDeferred.map((update, i) => {
        return update.usages.map((consumption, j) => {
          return {
            nim: update.nim,
            timestamp: consumption.timestamp,
            consumption: consumption.consumption,
            compositeKey: [
              update.nim,
              consumption.timestamp,
              consumption.consumption,
              i,
              j,
            ].join(),
            text: [
              'INSERT INTO meter_readings ("nmi", "timestamp","consumption")',
              `VALUES ('${update.nim}', '${consumption.timestamp}', ${consumption.consumption})`,
              'ON CONFLICT ("nmi", "timestamp") DO NOTHING;',
            ].join("\n"),
          };
        });
      })
    );
  }, [allUpdatesDeferred]);

  const shouldVirtualise = Number(flattenedData?.length) > VIRTUALIZE_THRESHOLD;

  const commands = useMemo(() => {
    if (!flattenedData) {
      return null;
    }

    if (!shouldVirtualise) {
      return flattenedData.map(({ compositeKey, text }) => (
        <div key={compositeKey}>{text}</div>
      ));
    }

    return (
      <div
        className={twJoin("h-full")}
        ref={ref}
        data-testid="virtualised-list"
      >
        <List
          height={height}
          itemCount={flattenedData?.length}
          itemSize={50}
          width={width}
        >
          {({ index, style }) => {
            const { compositeKey, text } = flattenedData[index];

            return (
              <div key={compositeKey} style={style}>
                {text}
              </div>
            );
          }}
        </List>
      </div>
    );
  }, [flattenedData, height, ref, shouldVirtualise, width]);

  return (
    <div
      className={twJoin(
        "h-screen",
        "w-screen",
        "overflow-hidden",
        "text-center",
        "p-[20px]"
      )}
    >
      <div
        className={twJoin(
          "w-full",
          "h-full",
          "flex",
          "flex-col",
          "gap-[18px]",
          "outline-hidden"
        )}
      >
        <h1>Tranform NEM12 CSV to Insert Scripts</h1>
        <Upload.Dragger
          accept=".csv"
          multiple={false}
          fileList={empty}
          data-testid="upload-input"
          beforeUpload={(file) => {
            const initUpdate = {
              nim: "",
              interval: 30,
              usages: [] as ConsumptionUpdateType[],
            };
            let update: typeof initUpdate | undefined;
            setIsParsing(true);
            setAllUpdates([]);
            requestIdleCallback(() => {
              const updateArr = allUpdates || [];
              papaparse.parse(file, {
                step(results) {
                  const data = results.data as string[];

                  const [lineType, nimOrDate, ...rest] = data;

                  if (lineType === "200") {
                    if (update) {
                      updateArr.push(update);
                      setAllUpdates(Array.from(updateArr));
                    }

                    update = cloneDeep(initUpdate);
                    update.nim = nimOrDate;
                    update.interval = Number(rest.at(6));
                    update.usages = [];
                  } else if (update && lineType === "300") {
                    update.usages = rest.map((consumption, i) => {
                      const timestamp = dayjs(nimOrDate, "YYYYMMDD")
                        .utc()
                        .startOf("day")
                        .add(Number(update?.interval) * (i + 1), "minutes")
                        .format("YYYY-MM-DD HH:mm");
                      return {
                        timestamp: timestamp,
                        consumption: Number(consumption),
                      };
                    });
                  }
                },
                complete() {
                  if (update) {
                    updateArr.push(update);
                  }
                  setAllUpdates(Array.from(updateArr));
                  setIsParsing(false);
                },
                error(error) {
                  notification.error({
                    message: "Error parsing file",
                    description: error.stack,
                  });
                  setIsParsing(false);
                },
                header: false,
                skipEmptyLines: true,
              });
            });

            return false;
          }}
          disabled={isParsing}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">
            Click or drag CSV to this area to upload
          </p>
        </Upload.Dragger>

        {!flattenedData ? null : (
          <>
            <div
              className={twJoin(
                "flex",
                "flex-row",
                "justify-end",
                "items-end",
                "gap-[8px]"
              )}
            >
              {isParsing ? (
                <div>Parsing data ...</div>
              ) : !shouldVirtualise ? (
                <div>
                  Displaying {Intl.NumberFormat().format(flattenedData.length)}{" "}
                  record(s)
                </div>
              ) : (
                <>
                  <div>
                    There are {Intl.NumberFormat().format(flattenedData.length)}{" "}
                    records, so the list is virtualised. To download all
                    scripts, click
                  </div>
                  <Button
                    type="primary"
                    loading={isParsing}
                    onClick={() => {
                      const fileName = "all-insert-script.txt";
                      downloadTextFile(
                        fileName,
                        flattenedData.map((datum) => datum.text).join("\n")
                      );
                      notification.success({
                        message: `Downloaded all scripts as ${fileName} file`,
                      });
                    }}
                  >
                    Download script as txt file
                  </Button>
                </>
              )}
            </div>

            <Card
              className={twJoin("flex-1", "overflow-auto")}
              css={css`
                .ant-card-body {
                  height: 100%;
                }
              `}
              data-testid="result-card"
            >
              {commands}

              {isParsing && <Loader />}
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
