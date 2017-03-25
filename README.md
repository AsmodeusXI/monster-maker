#Monster Maker ![Travis Build Status](https://travis-ci.org/AsmodeusXI/monster-maker.svg?branch=master)

##Making Monsters for Fun and Profit

##Local Development

To run monster-maker locally, a config/default.json file is needed. This is where critical static links and passwords should be contained. The file needs the following components.

 - __dbUrl:__ The URL for the local MongoDB instance used to store data.
 - __rsUrl:__ The URL for the Realmshaper User service required to validate users of the monster-maker API.
 - __port:__ The port on which the monster-maker API can be accessed.
 - __message:__ A message to display to prove that the server has started successfully.

Furthermore, there should be a separate object in the JSON file for each environment in which the monster-maker server will run. At the minimum, a 'local' object is required and would look as follows:

```javascript
{
    "local": {
        "dbUrl": "mongodb://localhost:27017",
        "rsUrl": "http://localhost:8081/api",
        "port": 8080,
        "message": "The local instance."
    }
}
```
