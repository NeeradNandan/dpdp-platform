import { render, screen } from "@testing-library/react";
import { Badge } from "../badge";

describe("Badge", () => {
  it("renders children text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies default variant styles", () => {
    render(<Badge>Default</Badge>);
    const el = screen.getByText("Default");
    expect(el.className).toContain("bg-gray-100");
  });

  it("applies success variant styles", () => {
    render(<Badge variant="success">OK</Badge>);
    expect(screen.getByText("OK").className).toContain("bg-green-100");
  });

  it("applies error variant styles", () => {
    render(<Badge variant="error">Fail</Badge>);
    expect(screen.getByText("Fail").className).toContain("bg-red-100");
  });

  it("applies warning variant styles", () => {
    render(<Badge variant="warning">Warn</Badge>);
    expect(screen.getByText("Warn").className).toContain("bg-amber-100");
  });

  it("applies info variant styles", () => {
    render(<Badge variant="info">Info</Badge>);
    expect(screen.getByText("Info").className).toContain("bg-blue-100");
  });

  it("merges custom className", () => {
    render(<Badge className="my-custom">Test</Badge>);
    expect(screen.getByText("Test").className).toContain("my-custom");
  });
});
