export const arr = (v) =>
  Array.isArray(v)
    ? v
    : (
        v?.data ??
        v?.departments ??
        v?.patients ??
        v?.beds ??
        v?.hours ??
        v?.roles ??
        v?.staff ??
        v?.escalations ??
        v?.alerts ??
        []
      );

export const num = (v, d = 1) =>
  v == null ? "—" : Number(v).toFixed(d);