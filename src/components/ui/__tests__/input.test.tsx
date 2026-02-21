import { render, screen, fireEvent } from "@testing-library/react";
import { Input } from "../input";

describe("Input", () => {
  it("renders a text input", () => {
    render(<Input placeholder="Enter text" />);
    expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
  });

  it("renders label when provided", () => {
    render(<Input label="Email" />);
    expect(screen.getByText("Email")).toBeInTheDocument();
  });

  it("generates id from label", () => {
    render(<Input label="Full Name" />);
    const input = screen.getByLabelText("Full Name");
    expect(input.id).toBe("full-name");
  });

  it("uses explicit id over generated one", () => {
    render(<Input label="Name" id="custom-id" />);
    expect(screen.getByLabelText("Name").id).toBe("custom-id");
  });

  it("shows error message", () => {
    render(<Input label="Email" error="Invalid email" />);
    expect(screen.getByRole("alert")).toHaveTextContent("Invalid email");
  });

  it("sets aria-invalid when error present", () => {
    render(<Input label="Email" error="Required" />);
    expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
  });

  it("does not set aria-invalid when no error", () => {
    render(<Input label="Email" />);
    expect(screen.getByLabelText("Email")).not.toHaveAttribute("aria-invalid");
  });

  it("handles onChange events", () => {
    const onChange = jest.fn();
    render(<Input onChange={onChange} placeholder="Type" />);
    fireEvent.change(screen.getByPlaceholderText("Type"), { target: { value: "test" } });
    expect(onChange).toHaveBeenCalled();
  });

  it("forwards ref", () => {
    const ref = { current: null as HTMLInputElement | null };
    render(<Input ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLInputElement);
  });

  it("does not render label when not provided", () => {
    const { container } = render(<Input placeholder="test" />);
    expect(container.querySelector("label")).toBeNull();
  });
});
