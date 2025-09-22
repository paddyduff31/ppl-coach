module.exports = {
  "ppl-coach-api": {
    input: {
      target: "http://localhost:5179/swagger/v1/swagger.json",
      validation: false,
    },
    output: {
      mode: "split",
      target: "src/generated",
      schemas: "src/generated/model",
      client: "react-query",
      mock: false,
      prettier: true,
      override: {
        mutator: {
          path: "./src/mutator/custom-instance.ts",
          name: "customInstance",
        },
        query: {
          useQuery: true,
          useInfinite: false,
          options: {
            staleTime: 10000,
            refetchOnWindowFocus: false,
          },
        },
      },
    },
  },
};
