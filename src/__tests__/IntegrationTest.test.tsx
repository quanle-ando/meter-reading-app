import "../index.css";
import { render, screen, configure } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { debug } from "vitest-preview";

configure({ asyncUtilTimeout: 5_000 });

window.requestIdleCallback = (cb) => {
  return setTimeout(cb, 1_000);
};

describe("IntegrationTest", { timeout: 60_000 }, () => {
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
      "200,NEM1201009,E1E2,2,E2,,01009,kWh,30,20050610",
      "300,20050301,0,0,0,0,0,0,0,0,0,0,0,0,0.154,0.460,0.770,1.003,1.059,1.750,1.423,1.200,0",
      "0050310121004,",
      "300,20050302,0,0,0,0,0,0,0,0,0,0,0,0,0.461,0.810,0.776,1.004,1.034,1.200,1.310,1.342,0",
      "0050310121004,",
      "300,20050303,0,0,0,0,0,0,0,0,0,0,0,0,0.335,0.667,0.790,1.023,1.145,1.777,1.563,1.344,1",
      "0050310121004,",
      "300,20050304,0,0,0,0,0,0,0,0,0,0,0,0,0.461,0.415,0.778,0.940,1.191,1.345,1.390,1.222,1",
      "0050310121004,",
      "500,O,S01009,20050310121004,",
      "900",
      "",
    ].join("\n");

    await userEvent.upload(
      screen.getByTestId("upload-input"),
      new File([nem12Lines], "upload.csv", { type: "text/csv" })
    );

    await screen.findByText("Displaying 42 record(s)");

    expect(await screen.findByTestId("result-card")).toMatchSnapshot();

    debug();
  });
});
