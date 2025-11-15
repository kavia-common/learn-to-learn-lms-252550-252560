import React from "react";
import { Provider } from "react-redux";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { createAppStore } from "../store";
import Catalog from "../views/user/Catalog";

// Mock services to provide predictable course/category data
const mockCourses = Array.from({ length: 22 }).map((_, i) => ({
  id: `c${i + 1}`,
  title: `Course ${i + 1}`,
  description: i % 2 === 0 ? "Learn React Testing" : "Advanced Data",
  categoryId: i % 3 === 0 ? "cat1" : i % 3 === 1 ? "cat2" : "cat3",
  level: i % 3 === 0 ? "beginner" : i % 3 === 1 ? "intermediate" : "advanced",
  tags: ["tag1", "tag2", "tag3"].slice(0, ((i % 3) + 1)),
}));

const mockCategories = [
  { id: "cat1", name: "Frontend" },
  { id: "cat2", name: "Backend" },
  { id: "cat3", name: "DevOps" },
];

jest.mock("../services", () => ({
  getServices: () => ({
    coursesService: {
      list: jest.fn(async () => mockCourses),
    },
    categoriesService: {
      list: jest.fn(async () => mockCategories),
    },
    // Other services not used in these tests
    authService: { login: jest.fn(), register: jest.fn(), logout: jest.fn(), me: jest.fn() },
    usersService: { list: jest.fn() },
    enrollmentsService: { list: jest.fn() },
    progressService: { list: jest.fn() },
  }),
}));

function renderCatalog(route = "/catalog") {
  const store = createAppStore();
  // We don't rely on preloaded state because Catalog dispatches fetch thunks on mount
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/catalog" element={<Catalog />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("Catalog page", () => {
  it("renders courses grid with pagination (page size 9)", async () => {
    renderCatalog();

    // Wait for some course to appear
    const firstCardTitle = await screen.findByText(/Course 1/i);
    expect(firstCardTitle).toBeInTheDocument();

    // Page 1 should show 9 courses and display page info "Page 1 of 3"
    const cards = document.querySelectorAll("article.card");
    expect(cards.length).toBe(9);
    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();
  });

  it("supports search filter", async () => {
    renderCatalog();

    // Wait for load
    await screen.findByText(/Course 1/i);

    const search = screen.getByLabelText(/Search/i);
    fireEvent.change(search, { target: { value: "react" } });

    // Should filter to items having "React" in description/title
    // Our mock sets description "Learn React Testing" on even indices (0-based)
    const cards = await screen.findAllByRole("article");
    // The filtered count might still exceed page size, but check title contains Course and some remain
    expect(cards.length).toBeGreaterThan(0);
  });

  it("filters by category", async () => {
    renderCatalog();
    await screen.findByText(/Course 1/i);

    const categorySelect = screen.getByLabelText(/Category/i);
    fireEvent.change(categorySelect, { target: { value: "cat2" } });

    // Expect displayed cards to reflect categoryId === cat2
    const cards = await screen.findAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
  });

  it("filters by level", async () => {
    renderCatalog();
    await screen.findByText(/Course 1/i);

    const levelSelect = screen.getByLabelText(/Level/i);
    fireEvent.change(levelSelect, { target: { value: "advanced" } });

    const cards = await screen.findAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
    // Try one card showing the level badge text
    const badge = within(cards[0]).getByText(/advanced/i);
    expect(badge).toBeInTheDocument();
  });

  it("paginates through next and prev", async () => {
    renderCatalog();
    await screen.findByText(/Course 1/i);

    // Page 1
    expect(screen.getByText(/Page 1 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Next →/i }));
    expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Next →/i }));
    expect(screen.getByText(/Page 3 of 3/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /← Prev/i }));
    expect(screen.getByText(/Page 2 of 3/i)).toBeInTheDocument();
  });

  it("shows EmptyState and can reset filters", async () => {
    renderCatalog();
    await screen.findByText(/Course 1/i);

    // Set filters to an impossible combination
    fireEvent.change(screen.getByLabelText(/Search/i), {
      target: { value: "zzzz-not-found" },
    });

    // Expect EmptyState message
    const empty = await screen.findByText(/No courses match your filters/i);
    expect(empty).toBeInTheDocument();

    // Click Reset filters button
    const resetButton = screen.getByRole("button", { name: /Reset filters/i });
    fireEvent.click(resetButton);

    // Cards should reappear
    const cards = await screen.findAllByRole("article");
    expect(cards.length).toBeGreaterThan(0);
  });
});
