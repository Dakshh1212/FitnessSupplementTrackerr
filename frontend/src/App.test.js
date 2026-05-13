import { render, screen } from "@testing-library/react";
import App from "./App";

test("renders auth page when not logged in", () => {
  render(<App />);

  const text = screen.getByText(/welcome/i);
  expect(text).toBeInTheDocument();
});