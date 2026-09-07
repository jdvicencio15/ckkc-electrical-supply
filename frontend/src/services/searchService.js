import searchApi from "../api/searchApi";

const searchService = {
  search: async (query) => {
    const data = await searchApi.search(query);

    return data;
  },
};

export default searchService;