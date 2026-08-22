import { render, screen, fireEvent } from "@testing-library/react";
import App from "./App";

test("renders the Moringa Box shopping experience", () => {
  render(<App />);
  expect(screen.getByRole("link", { name: /moringa box home/i })).toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: /a little green for your everyday/i }),
  ).toBeInTheDocument();
  expect(
    screen.getByRole("button", { name: /next page/i }),
  ).toBeInTheDocument();
});

test("adds and removes items from the shopping cart", () => {
  render(<App />);
  const addButtons = screen.getAllByRole("button", { name: /add to box/i });
  expect(addButtons.length).toBeGreaterThan(0);

  // Add first item to cart
  fireEvent.click(addButtons[0]);

  // Open cart
  const cartButton = screen.getByRole("button", { name: /open cart with 1 items/i });
  expect(cartButton).toBeInTheDocument();
  fireEvent.click(cartButton);

  // Verify item is in drawer
  expect(screen.getByRole("dialog", { name: /shopping cart/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /continue to checkout/i })).toBeEnabled();

  // Remove item from cart
  const removeButtons = screen.getAllByRole("button", { name: /remove/i });
  fireEvent.click(removeButtons[0]);

  // Verify empty cart message
  expect(screen.getByText(/your box is empty/i)).toBeInTheDocument();
});

test("toggles favorite state on item cards", () => {
  render(<App />);
  const heartButtons = screen.getAllByRole("button", { name: /save .* to favorites/i });
  expect(heartButtons.length).toBeGreaterThan(0);

  // Click heart to save
  fireEvent.click(heartButtons[0]);
  expect(screen.getByRole("button", { name: /remove .* from favorites/i })).toBeInTheDocument();
});

test("filters boxes by category", () => {
  render(<App />);
  const wellnessTab = screen.getByRole("tab", { name: /wellness/i });
  fireEvent.click(wellnessTab);
  expect(wellnessTab).toHaveAttribute("aria-selected", "true");
});

test("searches box text and returns matching results", () => {
  render(<App />);
  const search = screen.getByRole("textbox", { name: /search boxes/i });
  fireEvent.change(search, { target: { value: "focus" } });
  expect(screen.getByRole("heading", { name: /focus ritual box/i })).toBeInTheDocument();
  expect(screen.queryByRole("heading", { name: /starter kit/i })).not.toBeInTheDocument();
});

