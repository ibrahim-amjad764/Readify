import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { CopyButton } from "@/components/CopyButton";

// Mock clipboard API
const writeTextMock = jest.fn();

beforeEach(() => {
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: writeTextMock },
    writable: true,
    configurable: true,
  });
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

describe("CopyButton", () => {
  it("renders with default label 'Copy'", () => {
    render(<CopyButton text="hello" />);
    expect(screen.getByRole("button", { name: /copy/i })).toBeInTheDocument();
  });

  it("renders with custom label", () => {
    render(<CopyButton text="hello" label="Copy README" />);
    expect(
      screen.getByRole("button", { name: /copy readme/i })
    ).toBeInTheDocument();
  });

  it("calls clipboard.writeText with the provided text", async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    render(<CopyButton text="# Hello World" />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith("# Hello World");
    });
  });

  it("shows 'Copied!' after successful copy", async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    render(<CopyButton text="test" />);
    fireEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText("Copied!")).toBeInTheDocument();
    });
  });

  it("reverts to 'Copy' after 2200ms", async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    render(<CopyButton text="test" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(screen.getByText("Copied!")).toBeInTheDocument());

    act(() => {
      jest.advanceTimersByTime(2200);
    });

    await waitFor(() => {
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    });
  });

  it("is disabled while in 'copied' state", async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    render(<CopyButton text="test" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      const btn = screen.getByRole("button");
      expect(btn).toBeDisabled();
    });
  });
});
