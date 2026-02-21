import { render, screen } from "@testing-library/react";
import { StatCard } from "../stat-card";

describe("StatCard", () => {
  it("renders title and value", () => {
    render(<StatCard title="Total Consents" value={1250} />);
    expect(screen.getByText("Total Consents")).toBeInTheDocument();
    expect(screen.getByText("1250")).toBeInTheDocument();
  });

  it("renders string values", () => {
    render(<StatCard title="Score" value="85%" />);
    expect(screen.getByText("85%")).toBeInTheDocument();
  });

  it("shows change text when provided", () => {
    render(<StatCard title="Users" value={500} change="+12% from last month" />);
    expect(screen.getByText("+12% from last month")).toBeInTheDocument();
  });

  it("does not render change when not provided", () => {
    const { container } = render(<StatCard title="Users" value={500} />);
    expect(container.querySelectorAll("p")).toHaveLength(2);
  });

  it("applies positive change style", () => {
    render(<StatCard title="T" value={1} change="+5%" changeType="positive" />);
    expect(screen.getByText("+5%").className).toContain("text-green-600");
  });

  it("applies negative change style", () => {
    render(<StatCard title="T" value={1} change="-3%" changeType="negative" />);
    expect(screen.getByText("-3%").className).toContain("text-red-600");
  });

  it("renders icon when provided", () => {
    render(<StatCard title="T" value={1} icon={<span data-testid="icon">IC</span>} />);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
