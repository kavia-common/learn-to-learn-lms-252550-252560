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

// PUBLIC_INTERFACE
export function adaptCourse(remote) {
  const id = safeId(remote);
  return {
    id,
    title: remote?.title ?? remote?.name ?? "Untitled Course",
    description: remote?.description ?? remote?.summary ?? "",
    categoryId: remote?.categoryId ?? remote?.category?.id ?? null,
    level: remote?.level ?? "beginner",
    // extras
    tags: remote?.tags ?? [],
    _raw: remote,
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
