import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders the Moringa Box shopping experience", () => {
  render(<App />);
  expect(screen.getByText(/moringa box/i)).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /a little green for your everyday/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /next page/i }),
  ).toBeInTheDocument();
});
