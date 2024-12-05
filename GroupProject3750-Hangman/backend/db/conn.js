const { MongoClient, ServerApiVersion } = require('mongodb')
const uri = process.env.ALTAS_URI

let _db
module.exports = {
  connectToServer: function (callback) {
    console.log('Attempting to connect')
    // Create a MongoClient with a MongoClientOptions object to set the Stable API version
    const client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      }
    })

    async function run () {
      try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect()
        await client.db('admin').command({ ping: 1 })
        console.log(
          'Pinged your deployment. You successfully connected to MongoDB!'
        )
        _db = client.db('words')
        console.log('Sucessfully connected to words collection')
      } finally {
        // Ensures that the client will close when you finish/error
        //await client.close();
      }
    }
    run().catch(console.dir)
  },
  getDb: function () {
    return _db
  }
} //end of mongo exports
