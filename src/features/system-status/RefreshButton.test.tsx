import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import messages from "../../../messages/en.json";
import { RefreshButton } from "./RefreshButton";

const refreshMock = vi.fn();
let mockStatus: "idle" | "loading" | "success" | "error" = "idle";

vi.mock("./useRefreshHealth", () => ({
  useRefreshHealth: () => ({ status: mockStatus, refresh: refreshMock }),
}));

function renderWithIntl() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <RefreshButton />
    </NextIntlClientProvider>,
  );
}

describe("RefreshButton", () => {
  it("shows 'Refresh' and calls refresh() on click when idle", async () => {
    mockStatus = "idle";
    renderWithIntl();

    const button = screen.getByRole("button", { name: "Refresh" });
    expect(button).toBeEnabled();

    await userEvent.click(button);

    expect(refreshMock).toHaveBeenCalledOnce();
  });

  it("shows 'Refreshing...' and disables the button while loading", () => {
    mockStatus = "loading";
    renderWithIntl();

    expect(screen.getByRole("button", { name: "Refreshing..." })).toBeDisabled();
  });
});
