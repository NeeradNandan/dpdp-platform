import { render, screen } from "@testing-library/react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../card";

describe("Card", () => {
  it("renders children", () => {
    render(<Card>Content</Card>);
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(<Card className="custom">X</Card>);
    expect(container.firstChild).toHaveClass("custom");
  });
});

describe("CardHeader", () => {
  it("renders children", () => {
    render(<CardHeader>Header</CardHeader>);
    expect(screen.getByText("Header")).toBeInTheDocument();
  });
});

describe("CardTitle", () => {
  it("renders as h3", () => {
    render(<CardTitle>Title</CardTitle>);
    const el = screen.getByText("Title");
    expect(el.tagName).toBe("H3");
  });
});

describe("CardDescription", () => {
  it("renders description text", () => {
    render(<CardDescription>Desc</CardDescription>);
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });
});

describe("CardContent", () => {
  it("renders content children", () => {
    render(<CardContent>Body</CardContent>);
    expect(screen.getByText("Body")).toBeInTheDocument();
  });
});

describe("CardFooter", () => {
  it("renders footer children", () => {
    render(<CardFooter>Footer</CardFooter>);
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("has border-t styling", () => {
    const { container } = render(<CardFooter>F</CardFooter>);
    expect(container.firstChild).toHaveClass("border-t");
  });
});
