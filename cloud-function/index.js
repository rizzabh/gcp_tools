exports.rblpractice = (req, res) => {
    const data = req.body || {};
    res.status(200).send({
      message: "Function executed successfully!",
      receivedData: data
    });
  };