import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { describe, expect, it, vi } from "vitest";
import messages from "../../../messages/en.json";

const replaceMock = vi.fn();
vi.mock("@/i18n/navigation", () => ({
  usePathname: () => "/",
  useRouter: () => ({ replace: replaceMock }),
}));

describe("LocaleSwitcher", () => {
  it("switches locale while preserving the current pathname", async () => {
    const { LocaleSwitcher } = await import("./LocaleSwitcher");

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <LocaleSwitcher />
      </NextIntlClientProvider>,
    );

    await userEvent.selectOptions(screen.getByLabelText("Language"), "vi");

    expect(replaceMock).toHaveBeenCalledWith("/", { locale: "vi" });
  });
});
