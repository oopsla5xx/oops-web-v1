import { act, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { beforeEach, describe, expect, it } from "vitest";
import messagesEn from "../../../messages/en.json";
import messagesVi from "../../../messages/vi.json";
import type { ErrorCode } from "@/constants/error-codes";
import { SystemStatusView } from "./SystemStatusView";
import { useSystemStatusStore } from "./store";

const initialState = useSystemStatusStore.getState();
const initialData = { status: "ok", service: "oops-api-v1", version: "1.0.0" };

function renderWithIntl(
  locale: "en" | "vi" = "en",
  props: { initialData?: typeof initialData | null; initialErrorCode?: ErrorCode | null } = {},
) {
  const messages = locale === "en" ? messagesEn : messagesVi;
  return render(
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SystemStatusView
        initialData={props.initialData !== undefined ? props.initialData : initialData}
        initialErrorCode={props.initialErrorCode}
      />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  useSystemStatusStore.setState(initialState, true);
});

describe("SystemStatusView", () => {
  it("renders the server-provided initial data before any refresh happens", () => {
    renderWithIntl();

    expect(screen.getByTestId("status-data")).toHaveTextContent("oops-api-v1");
    expect(screen.getByTestId("status-data")).toHaveTextContent("1.0.0");
  });

  it("renders a loading state instead of the data while the store is loading", () => {
    act(() => useSystemStatusStore.getState().setLoading());

    renderWithIntl();

    expect(screen.getByTestId("status-loading")).toBeInTheDocument();
    expect(screen.queryByTestId("status-data")).not.toBeInTheDocument();
  });

  it("renders the translated error message for the stored error code (en)", () => {
    act(() => useSystemStatusStore.getState().setError("NETWORK_ERROR"));

    renderWithIntl("en");

    expect(screen.getByTestId("status-error")).toHaveTextContent(
      "Could not reach the server. Check your connection.",
    );
    expect(screen.queryByTestId("status-data")).not.toBeInTheDocument();
  });

  it("renders the translated error message for the stored error code (vi)", () => {
    act(() => useSystemStatusStore.getState().setError("NETWORK_ERROR"));

    renderWithIntl("vi");

    expect(screen.getByTestId("status-error")).toHaveTextContent(
      "Không thể kết nối tới máy chủ. Kiểm tra kết nối mạng của bạn.",
    );
  });

  it("renders the translated error for initialErrorCode when the initial SSR fetch failed and no refresh has happened yet", () => {
    renderWithIntl("en", { initialData: null, initialErrorCode: "NETWORK_ERROR" });

    expect(screen.getByTestId("status-error")).toHaveTextContent(
      "Could not reach the server. Check your connection.",
    );
    expect(screen.queryByTestId("status-data")).not.toBeInTheDocument();
  });

  it("prefers the store's own error state over initialErrorCode once a refresh has happened", () => {
    act(() => useSystemStatusStore.getState().setError("TIMEOUT"));

    renderWithIntl("en", { initialData: null, initialErrorCode: "NETWORK_ERROR" });

    expect(screen.getByTestId("status-error")).toHaveTextContent(
      "The request timed out. Please try again.",
    );
  });
});
