import "../index.css";
import "@testing-library/jest-dom";
import { render, screen, configure } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { debug } from "vitest-preview";
import { downloadTextFile } from "../utils/downloadTextFile";

configure({ asyncUtilTimeout: 5_000 });

window.requestIdleCallback = (cb) => {
  return setTimeout(cb, 1_000);
};

vi.mock(import("../constants/VIRTUALIZE_THRESHOLD"), () => ({
  default: 5 as 5_000,
}));
vi.mock(import("use-resize-observer"), () => ({
  default: vi.fn().mockReturnValue({}),
}));
vi.mock(import("../utils/downloadTextFile"));

describe("IntegrationTest_testVirtualized", { timeout: 60_000 }, () => {
  it("should render page correctly", async () => {
    render(<div id="root" />);

    await import("../main");

    await screen.findByText("Tranform NEM12 CSV to Insert Scripts");
    const nem12Lines = [
      "100,NEM12,200506081149,UNITEDDP,NEMMCO",
      "200,NEM1201009,E1E2,1,E1,N1,01009,kWh,30,20050610",
      "300,20050301,0,0,0,0,0,0,0,0,0,0,0,0,0.461,0.810,0.568,1.234,1.353,1.507,1.344,1.773,0",
      "300,20050302,0,0,0,0,0,0,0,0,0,0,0,0,0.235,0.567,0.890,1.123,1.345,1.567,1.543,1.234,0",
      "300,20050303,0,0,0,0,0,0,0,0,0,0,0,0,0.261,0.310,0.678,0.934,1.211,1.134,1.423,1.370,0",
      "300,20050304,0,0,0,0,0,0,0,0,0,0,0,0,0.335,0.667,0.790,1.023,1.145,1.777,1.563,1.344,1",
      "500,O,S01009,20050310121004,",
      "900",
      "",
    ].join("\n");

    await userEvent.upload(
      screen.getByTestId("upload-input"),
      new File([nem12Lines], "upload.csv", { type: "text/csv" })
    );

    await screen.findByText(
      "There are 21 records, so the list is virtualised. To download all scripts, click"
    );

    await userEvent.click(
      await screen.findByText("Download script as txt file")
    );

    await new Promise((r) => setTimeout(r, 2_000));

    expect(
      await screen.findByText(
        "Downloaded all scripts as all-insert-script.txt file"
      )
    ).toBeInTheDocument();

    expect(vi.mocked(downloadTextFile).mock.calls).toMatchInlineSnapshot(`
      [
        [
          "all-insert-script.txt",
          "INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 00:30', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 01:00', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 01:30', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 02:00', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 02:30', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 03:00', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 03:30', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 04:00', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 04:30', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 05:00', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 05:30', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 06:00', 0)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 06:30', 0.335)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 07:00', 0.667)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 07:30', 0.79)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 08:00', 1.023)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 08:30', 1.145)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 09:00', 1.777)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 09:30', 1.563)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 10:00', 1.344)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;
      INSERT INTO meter_readings ("nmi", "timestamp","consumption")
      VALUES ('NEM1201009', '2005-03-03 10:30', 1)
      ON CONFLICT ("nmi", "timestamp") DO NOTHING;",
        ],
      ]
    `);

    debug();
  });
});
