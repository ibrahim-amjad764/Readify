/**
 * UrlInput component tests — loading state, validation feedback, keyboard events.
 */

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UrlInput } from "@/components/UrlInput";

// ── Helpers ──────────────────────────────────────────────────────────────────

function setup(overrides: Partial<React.ComponentProps<typeof UrlInput>> = {}) {
  const defaults: React.ComponentProps<typeof UrlInput> = {
    value: "",
    onChange: jest.fn(),
    onSubmit: jest.fn(),
    isLoading: false,
    ...overrides,
  };
  render(<UrlInput {...defaults} />);
  return defaults;
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe("UrlInput", () => {
  it("renders the input field", () => {
    setup();
    expect(
      screen.getByPlaceholderText(/github\.com\/owner\/repository/i)
    ).toBeInTheDocument();
  });

  it("renders the Generate button", () => {
    setup();
    expect(
      screen.getByRole("button", { name: /generate/i })
    ).toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const onChange = jest.fn();
    setup({ onChange });
    const input = screen.getByPlaceholderText(/github\.com/i);
    await userEvent.type(input, "h");
    expect(onChange).toHaveBeenCalled();
  });

  it("shows validation error for empty submission", async () => {
    setup({ value: "" });
    fireEvent.click(screen.getByRole("button", { name: /generate/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/please enter a github repository url/i)
      ).toBeInTheDocument();
    });
  });

  it("shows validation error for non-GitHub URL", async () => {
    setup({ value: "https://gitlab.com/user/repo" });
    fireEvent.click(screen.getByRole("button", { name: /generate/i }));
    await waitFor(() => {
      expect(
        screen.getByText(/doesn't look like a github url/i)
      ).toBeInTheDocument();
    });
  });

  it("calls onSubmit with a valid URL", async () => {
    const onSubmit = jest.fn();
    setup({ value: "https://github.com/vercel/next.js", onSubmit });
    fireEvent.click(screen.getByRole("button", { name: /generate/i }));
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("https://github.com/vercel/next.js");
    });
  });

  it("submits on Enter key", async () => {
    const onSubmit = jest.fn();
    setup({ value: "https://github.com/facebook/react", onSubmit });
    const input = screen.getByPlaceholderText(/github\.com/i);
    fireEvent.keyDown(input, { key: "Enter", code: "Enter" });
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith("https://github.com/facebook/react");
    });
  });

  it("disables Generate button when isLoading is true", () => {
    setup({ value: "https://github.com/user/repo", isLoading: true });
    const btn = screen.getByRole("button", { name: /generating/i });
    expect(btn).toBeDisabled();
  });

  it("shows spinner when loading", () => {
    setup({ value: "https://github.com/user/repo", isLoading: true });
    // Lucide Loader2 renders an SVG; check the accessible button label
    expect(
      screen.getByRole("button", { name: /generating/i })
    ).toBeInTheDocument();
  });
});
