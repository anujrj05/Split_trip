export const getApiErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again."
) => {
  if (error?.response?.data?.message) {
    return `Error: ${error.response.data.message}`;
  }

  if (error?.request) {
    return "Cannot connect to backend. Please check if backend server is running.";
  }

  return fallback;
};
