import { render, screen, fireEvent } from "@testing-library/react";
import { FaqAccordion } from "../faq-accordion";

const items = [
  { question: "What is DPDP?", answer: "India's data protection law." },
  { question: "Who must comply?", answer: "All businesses processing personal data." },
  { question: "What are penalties?", answer: "Up to Rs 250 crore." },
];

describe("FaqAccordion", () => {
  it("renders all questions", () => {
    render(<FaqAccordion items={items} />);
    items.forEach((item) => {
      expect(screen.getByText(item.question)).toBeInTheDocument();
    });
  });

  it("starts with all items collapsed", () => {
    render(<FaqAccordion items={items} />);
    const buttons = screen.getAllByRole("button");
    buttons.forEach((btn) => {
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });
  });

  it("expands an item on click", () => {
    render(<FaqAccordion items={items} />);
    const firstButton = screen.getByText("What is DPDP?").closest("button")!;
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("India's data protection law.")).toBeInTheDocument();
  });

  it("collapses an open item when clicked again", () => {
    render(<FaqAccordion items={items} />);
    const firstButton = screen.getByText("What is DPDP?").closest("button")!;
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(firstButton);
    expect(firstButton).toHaveAttribute("aria-expanded", "false");
  });

  it("only one item is open at a time", () => {
    render(<FaqAccordion items={items} />);
    const buttons = screen.getAllByRole("button");

    fireEvent.click(buttons[0]);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "true");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "false");

    fireEvent.click(buttons[1]);
    expect(buttons[0]).toHaveAttribute("aria-expanded", "false");
    expect(buttons[1]).toHaveAttribute("aria-expanded", "true");
  });

  it("renders empty list without errors", () => {
    const { container } = render(<FaqAccordion items={[]} />);
    expect(container.querySelector("dl")).toBeInTheDocument();
    expect(screen.queryAllByRole("button")).toHaveLength(0);
  });
});
