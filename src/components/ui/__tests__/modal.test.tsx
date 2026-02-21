import { render, screen, fireEvent } from "@testing-library/react";
import { Modal } from "../modal";

describe("Modal", () => {
  const onClose = jest.fn();

  beforeEach(() => {
    onClose.mockClear();
  });

  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal isOpen={false} onClose={onClose}>Content</Modal>
    );
    expect(container.querySelector("[role='dialog']")).toBeNull();
  });

  it("renders children when open", () => {
    render(<Modal isOpen={true} onClose={onClose}>Modal Body</Modal>);
    expect(screen.getByText("Modal Body")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<Modal isOpen={true} onClose={onClose} title="Test Title">Body</Modal>);
    expect(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("has role=dialog and aria-modal", () => {
    render(<Modal isOpen={true} onClose={onClose}>X</Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-modal", "true");
  });

  it("calls onClose when close button clicked", () => {
    render(<Modal isOpen={true} onClose={onClose} title="T">Body</Modal>);
    fireEvent.click(screen.getByLabelText("Close modal"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when backdrop clicked", () => {
    render(<Modal isOpen={true} onClose={onClose}>Body</Modal>);
    const backdrop = document.querySelector("[aria-hidden='true']")!;
    fireEvent.click(backdrop);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose on Escape key", () => {
    render(<Modal isOpen={true} onClose={onClose}>Body</Modal>);
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("applies size classes", () => {
    render(<Modal isOpen={true} onClose={onClose} size="lg">Big</Modal>);
    const dialog = screen.getByRole("dialog");
    expect(dialog.className).toContain("max-w-2xl");
  });

  it("prevents body scroll when open", () => {
    render(<Modal isOpen={true} onClose={onClose}>X</Modal>);
    expect(document.body.style.overflow).toBe("hidden");
  });
});
