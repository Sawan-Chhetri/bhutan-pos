import authFetch from "./authFetch";

export const fetcher = (url) =>
  authFetch(url).then((res) => {
    if (!res.ok) {
      const error = new Error("An error occurred while fetching the data.");
      // Attach extra info to the error object.
      error.info = res.json();
      error.status = res.status;
      throw error;
    }
    return res.json();
  });
