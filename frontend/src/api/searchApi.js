import API from "./axios";

const searchApi = {
  search: async (query) => {
    const response = await API.get("/search", {
      params: {
        q: query,
      },
    });

    return response.data;
  },
};

export default searchApi;