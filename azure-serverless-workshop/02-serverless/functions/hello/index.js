module.exports = async function (context) {
  return {
    status: 200,
    body: "This is my code running in a Function App!  Yippee!",
    headers: {
      "content-type": "text/html",
    },
  };
};
