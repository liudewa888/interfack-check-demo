import { request } from "../utils/request";

export const isLogin = (data) => {
  const url = "/isLogin";
  return request.get(url, data);
};
