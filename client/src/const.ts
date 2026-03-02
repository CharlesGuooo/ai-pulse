export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Returns the login page path.
// Previously used OAuth portal URL, but now uses username/password login.
export const getLoginUrl = () => {
  return "/login";
};
