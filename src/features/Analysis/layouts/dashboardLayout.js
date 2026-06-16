export const dashboardGrid = {
  display: "grid",
  gap: 20,
};

export const twoCol = {
  ...dashboardGrid,
  gridTemplateColumns: "2fr 1fr",
};

export const equalTwoCol = {
  ...dashboardGrid,
  gridTemplateColumns: "1fr 1fr",
};

export const threeCol = {
  ...dashboardGrid,
  gridTemplateColumns: "repeat(3,1fr)",
};

export const fiveCol = {
  ...dashboardGrid,
  gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
};