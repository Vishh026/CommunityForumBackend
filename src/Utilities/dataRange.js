function getDateRange({ range, from, to }) {
  const now = new Date();
  let startDate;
  let endDate = now;

  switch (range) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;

    case "7d":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;

    case "30d":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      break;

    case "custom":
      if (!from || !to) {
        throw new Error("Custom range requires from & to dates");
      }
      startDate = new Date(from);
      endDate = new Date(to);
      break;

    default:
      // fallback → last 7 days
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
  }

  return { startDate, endDate };
}

module.exports = { getDateRange };