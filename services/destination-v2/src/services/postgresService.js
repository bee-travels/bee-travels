const { Client } = require("pg");

var types = require("pg").types;
types.setTypeParser(1700, function (val) {
  return parseFloat(val);
});

async function getDestinationDataFromPostgres() {
  const client = new Client({
    connectionString: process.env.DATABASE,
  });

  try {
    client.connect();

    const res = await client.query("SELECT * FROM destination");
    return res.rows;
  } catch (err) {
    console.log(err.stack);
  } finally {
    client.end();
  }
}

export { getDestinationDataFromPostgres };
