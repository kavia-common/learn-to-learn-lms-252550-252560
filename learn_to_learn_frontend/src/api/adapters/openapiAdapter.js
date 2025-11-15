//
// PUBLIC_INTERFACE
// Adapter functions to map remote API schemas into BrainBoost's internal models.
// These are defensive (tolerant of extra/missing fields) and ensure "id" exists.
//

function safeId(x) {
  if (x == null) return null;
  // Typical id fields found in OSS APIs
  return x.id ?? x._id ?? x.uuid ?? x.slug ?? null;
}

// PUBLIC_INTERFACE
export function adaptUser(remote) {
  const id = safeId(remote);
  return {
    id,
    name: remote?.name ?? remote?.fullName ?? remote?.username ?? "User",
    email: remote?.email ?? null,
    role: remote?.role ?? remote?.userRole ?? "user",
    avatarUrl: remote?.avatar ?? remote?.avatarUrl ?? null,
    // Keep raw in case downstream needs extra fields
    _raw: remote,
  };
}

 /**
 * PUBLIC_INTERFACE
 * Generic course adapter (local/mock). For DummyJSON use mapProductFromDummyJSON().
 */
export function adaptCourse(remote) {
  const id = safeId(remote);
  return {
    id,
    title: remote?.title ?? remote?.name ?? "Untitled Course",
    description: remote?.description ?? remote?.summary ?? "",
    categoryId: remote?.categoryId ?? remote?.category?.id ?? remote?.category ?? null,
    level: remote?.level ?? "beginner",
    durationMinutes: remote?.durationMinutes ?? null,
    lessonsCount: remote?.lessonsCount ?? null,
    author: remote?.author ?? null,
    tags: remote?.tags ?? [],
    thumbnailUrl: remote?.thumbnailUrl ?? remote?.thumbnail ?? null,
    images: Array.isArray(remote?.images) ? remote.images : [],
    _raw: remote,
  };
}

// PUBLIC_INTERFACE
export function mapCategoryListFromDummyJSON(list) {
  /**
   * Maps DummyJSON /products/categories array of strings to LMS Category model.
   * Category { id: slugifiedName, name, description:'', color: derived }
   */
  const toSlug = (s) =>
    String(s || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  const colors = ["#2563EB", "#F59E0B", "#10B981", "#EF4444", "#8B5CF6", "#0EA5E9"];
  return (Array.isArray(list) ? list : []).map((name, idx) => {
    const slug = toSlug(name);
    return {
      id: slug || `cat-${idx}`,
      name: String(name || "Category"),
      description: "",
      color: colors[idx % colors.length],
      _raw: name,
    };
  });
}

// PUBLIC_INTERFACE
export function mapProductListFromDummyJSON(payload) {
  /**
   * Maps DummyJSON /products or /products/category/... or /products/search
   * payload shape: { products: [], total, skip, limit }
   * to LMS Course array with pagination meta passthrough in _meta.
   */
  const products = Array.isArray(payload?.products) ? payload.products : [];
  const courses = products.map((p) => {
    const rating = Number(p?.rating ?? 0);
    const level =
      rating >= 4.2 ? "advanced" : rating >= 3 ? "intermediate" : "beginner";
    const durationMinutes =
      p?.price != null ? Math.max(15, Math.round(Number(p.price) * 2)) : 60;
    const lessonsCount =
      p?.stock != null ? Math.max(4, Math.round(Number(p.stock) / 10)) : 8;
    return {
      id: p?.id ?? null,
      title: p?.title ?? "Untitled Course",
      description: p?.description ?? "",
      categoryId: p?.category ?? null,
      level,
      durationMinutes,
      lessonsCount,
      author: p?.brand ?? "BrainBoost",
      tags: [],
      thumbnailUrl: p?.thumbnail ?? null,
      publishedAt: null,
      status: "published",
      _raw: p,
    };
  });
  return {
    items: courses,
    total: Number(payload?.total ?? courses.length),
    skip: Number(payload?.skip ?? 0),
    limit: Number(payload?.limit ?? courses.length),
  };
}

// PUBLIC_INTERFACE
export function mapProductFromDummyJSON(p) {
  if (!p || typeof p !== "object") {
    return null;
  }
  const rating = Number(p?.rating ?? 0);
  const level = rating >= 4.2 ? "advanced" : rating >= 3 ? "intermediate" : "beginner";
  const durationMinutes =
    p?.price != null ? Math.max(15, Math.round(Number(p.price) * 2)) : 60;
  const lessonsCount =
    p?.stock != null ? Math.max(4, Math.round(Number(p.stock) / 10)) : 8;
  return {
    id: p?.id ?? null,
    title: p?.title ?? "Untitled Course",
    description: p?.description ?? "",
    categoryId: p?.category ?? null,
    level,
    durationMinutes,
    lessonsCount,
    author: p?.brand ?? "BrainBoost",
    tags: [],
    thumbnailUrl: p?.thumbnail ?? null,
    images: Array.isArray(p?.images) ? p.images : [],
    publishedAt: null,
    status: "published",
    _raw: p,
  };
}

// PUBLIC_INTERFACE
export function adaptCategory(remote) {
  const id = safeId(remote);
  return {
    id,
    name: remote?.name ?? remote?.title ?? "Category",
    description: remote?.description ?? "",
    _raw: remote,
  };
}

// PUBLIC_INTERFACE
export function adaptEnrollment(remote) {
  const id = safeId(remote);
  return {
    id,
    userId: remote?.userId ?? remote?.user?.id ?? null,
    courseId: remote?.courseId ?? remote?.course?.id ?? null,
    status: remote?.status ?? "active",
    _raw: remote,
  };
}

// PUBLIC_INTERFACE
export function adaptProgress(remote) {
  const id = safeId(remote);
  return {
    id,
    userId: remote?.userId ?? remote?.user?.id ?? null,
    courseId: remote?.courseId ?? remote?.course?.id ?? null,
    percent: Number(remote?.percent ?? remote?.completion ?? 0),
    updatedAt: remote?.updatedAt ?? remote?.updated_at ?? remote?.timestamp ?? null,
    _raw: remote,
  };
}
