//this file lists off the functions that will be avalible for the notification engine.


//Pull saved queries.
//Gets a list of saved queries and displays them by name.


var elasticsearch = require('elasticsearch');



// var searchquery =
// {
// //  http://192.168.1.104:9200/_search
//     "query": {
//         "match": {
//             "_type": "search"
//         }
//     }
// }
var elasticClient = new elasticsearch.Client({
    host: '127.0.0.1:9200',
    sniffOnStart: true,
    apiVersion:'2.2',
    log: 'trace'
});
elasticClient.Connection();

module.exports.testQuery= function(req,res,next){
console.log('Test Query');

  //return a list of search types.
  elasticClient.search({
    type:'search',
    title:'BlaBla'
  }).then(function (body) {
    var hits = body.hits.hits;
    //res.send(hits);
  //  res.send(hits[0]._source.kibanaSavedObjectMeta.searchSourceJSON);
res.send(hits[0]._source.kibanaSavedObjectMeta.searchSourceJSON);
var query = hits[0]._source.kibanaSavedObjectMeta.searchSourceJSON;
      elasticClient.search(query

    ).then(function (body) {
      var hits = body.hits.hits;
      res.send(hits);
    }, function (error) {
      console.trace(error.message);
    });

  }, function (error) {
    console.trace(error.message);
  });

//next();

}

// $scope.searchList= [
//   {ID:"1",Title:"Search Example",SearchString:"searchstring"},
//   {ID:"2",Title:"Another Search",SearchString:"searchstring"},
//   {ID:"3",Title:"Another Example",SearchString:"searchstring"},
// ];
module.exports.ListSearches= function(req,res,next){
console.log('Get List Of searches');

  //return a list of search types.
  elasticClient.search({
    type:'search'
  }).then(function (body) {
    var searches=[];
    for(var result in hits)
    {
      searches.push(result);
    }
    res.send(searches);
  }, function (error) {
    console.trace(error.message);
  });
}


function getQuery(queryName){
  elasticClient.search({
    type:'search',
    name:queryName
  }).then(function (body) {
    var hits = body.hits.hits;
  //  res.send(hits[0]._source.kibanaSavedObjectMeta.searchSourceJSON);
    return hits[0];

  }, function (error) {
    console.trace(error.message);
  });
}
//Call search by name
module.exports.CallQuery= function(req,res,next){
  var queryName = req.body.queryName;
  var query = getQuery(queryName)
  .then(function(query){}
    elasticClient.search(
    query
  ).then(function (body) {
    var hits = body.hits.hits;
    res.send(hits);
  }, function (error) {
    console.trace(error.message);
  });
}
);

}



module.exports.pingCluster = function(){
  client.ping({
    requestTimeout: 30000,

    // undocumented params are appended to the query string
    hello: "elasticsearch"
  }, function (error) {
    if (error) {
      console.error('elasticsearch cluster is down!');
    } else {
      console.log('All is well');
    }
  });
}


module.exports.testSearchExists = function(req,res,next){
console.log('searchexists');
   elasticClient.count(
     {index:"temperature-*",
     q:"apple"}

).then(function (body) {
  var hits = body.hits.hits;
  res.send(hits);
}, function (error) {
  console.trace(error.message);
});
next();
}


module.exports.ListSearches= function(req,res,next){
console.log('Get List Of searches');

  //return a list of search types.
  elasticClient.search({
    type:'search'
  }).then(function (body) {
    var hits = body.hits.hits;
    res.send(hits);
  }, function (error) {
    console.trace(error.message);
  });
}

module.exports.ListSearches= function(req,res,next){
console.log('Get Named Of Search');

  //return a list of search types.
  elasticClient.search({
    type:'search'
  }).then(function (body) {
    var hits = body.hits.hits;
    res.send(hits[0]);
    //res.send(hits);
  }, function (error) {
    console.trace(error.message);
  });
}
