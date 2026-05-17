import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import { CopyButton } from "../CopyButton";

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

  it("reverts to 'Copy' after duration (2000ms)", async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    render(<CopyButton text="test" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(screen.getByText("Copied!")).toBeInTheDocument());

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    await waitFor(() => {
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  it("is disabled while in 'copied' state", async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    render(<CopyButton text="test" />);
    const button = screen.getByRole("button");

    fireEvent.click(button);

    await waitFor(() => {
      expect(button).toBeDisabled();
    });
  });

  it("handles clipboard write failure gracefully", async () => {
    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    writeTextMock.mockRejectedValueOnce(new Error("Clipboard failed"));

    render(<CopyButton text="test" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  it("respects default duration (2000ms)", async () => {
    writeTextMock.mockResolvedValueOnce(undefined);
    render(<CopyButton text="test" />);
    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => expect(screen.getByText("Copied!")).toBeInTheDocument());

    act(() => {
      jest.advanceTimersByTime(1900);
    });
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    act(() => {
      jest.advanceTimersByTime(100);
    });
    await waitFor(() => {
      expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
    });
  });

  it("renders with custom label prop", () => {
    render(<CopyButton text="test" label="Custom Button" />);
    expect(screen.getByRole("button", { name: /custom button/i })).toBeInTheDocument();
  });
});