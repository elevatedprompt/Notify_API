//this file lists off the functions that will be avalible for the notification engine.


//Pull saved queries.
//Gets a list of saved queries and displays them by name.

var Q = require ('q');
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
var elastichost = '192.168.1.104:9200';//'127.0.0.1:9200';
var tracelevel = 'debug';

var elasticClient = new elasticsearch.Client({
    host: elastichost,
    sniffOnStart: true,
    apiVersion:'2.2',
    log: tracelevel
});
//elasticClient.Connection();


module.exports.pingCluster = function(req,res,next){
  elasticClient.ping({
    requestTimeout: 30000,

    // undocumented params are appended to the query string
    hello: "elasticsearch"
  }, function (error) {
    if (error) {
      console.error('elasticsearch cluster is down!');
      res.sendStatus(false);
      next();
    } else {
      console.log('All is well');
      res.sendStatus(true);
      next();
    }
  });
}


module.exports.ListSearches= function(req,res,next){
console.log('Get List Of searches');

  //return a list of search types.
  elasticClient.search({
    type:'search',
    name:''
  }).then(function (body) {
    var searches=[];
    for(var result in body.hits.hits)
    {
      searches.push(result);
    }
    res.sendStatus(searches);
  //  next();
  }, function (error) {
    console.trace(error.message);
  });
}
///Alternate
/*
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
*/

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

//EvaluateSearchInternal
//queryName - Query name
//timeFrame - time frame Now till - (24h or 2m)
module.exports.EvaluateSearchInternal = function(queryName,timeFrame){
  console.log("Evaluate Search Internal");
var query = getQueryString(queryName).then(function(result){
  runTimeFrameSearchInternal(result,timeFrame)
  .then(function(queryResult){
    return queryResult;
  });
},function(err){
  return err;
});
}


module.exports.EvaluateSearch = function(req,res,next){
var queryName = req.body.queryName;
var timeFrame = req.body.timeFrame;
var query = getQueryString(queryName).then(function(result){
  runTimeFrameSearchInternal(result,timeFrame)
  .then(function(queryResult){
    res.sendStatus(queryResult);
    next();
  });
},function(err){
  console.log(err.message);
  res.sendStatus(err.message);
  next();
});
}

//Call search by name
module.exports.CallQuery= function(req,res,next){
  console.log("call query called");
  var queryName = req.body.queryName;

  console.log('Get Query');
   var query = getQueryString(queryName).then(function(result){
      console.log('return from query');
      console.log(result);
      runSearchInternal(result).then(function(innerresult){
        console.log("return from inner query");
        console.log(innerresult);
        console.log(innerresult.total);
        //console.log(innerresult);
        res.sendStatus(innerresult);
        next();
      },function(err)
    {
      console.log(err.message);
    });
   });
}


function runSearchInternal(query,timeFrame)
{
  var deferred = Q.defer();
  console.log("Run Search Internal");
  console.log(query);
  var search = JSON.parse(query);
  console.log("post query" + search.query.query_string);

  var x = {
    index:search.index,
    searchType:"count",
    q:'@timestamp:(>now-24h) AND ' +search.query.query_string.query//,
    //'@timestamp':"(>now-15m)"
  };

    //search.query
  elasticClient.search(x).then(
    function(result){
      var ii = 0, hits_in, hits_out = [];
      hits_in = (result.hits || {}).hits || [];
      deferred.resolve(result.hits);
      var result;
      for(; ii < hits_in.length; ii++) {
          result = JSON.stringify(hits_in[ii]._source.kibanaSavedObjectMeta.searchSourceJSON);
      }
      console.log("Search result");
      console.log(result.hits);
      return result.hits;

      // console.log("inside result response");
      // console.log(JSON.stringify(result));
      // console.log(result);
      // return JSON.stringify(result);
    }, function (error) {
      console.trace(error.message);
      deferred.reject(error.message);
      return deferred.promise;
    }
  );
  return deferred.promise;
}

function runTimeFrameSearchInternal(query,timeFrame)
{
  var deferred = Q.defer();
  console.log("Run Time Frame Search Internal");
  //console.log(query);
  var search = JSON.parse(query);
  console.log("post query" + JSON.stringify(search.query.query_string));

  var x = {
    index:search.index,
    searchType:"count",
    q:'@timestamp:(>now-' + timeFrame + ') AND ' +search.query.query_string.query//,
    //'@timestamp':"(>now-15m)"
  };

    //search.query
  elasticClient.search(x).then(
    function(result){
      var ii = 0, hits_in, hits_out = [];
      hits_in = (result.hits || {}).hits || [];
      deferred.resolve(result.hits);
      var result;
      for(; ii < hits_in.length; ii++) {
          result = JSON.stringify(hits_in[ii]._source.kibanaSavedObjectMeta.searchSourceJSON);
      }
      console.log("Search result");
      console.log(result.hits);
      return result.hits;

      // console.log("inside result response");
      // console.log(JSON.stringify(result));
      // console.log(result);
      // return JSON.stringify(result);
    }, function (error) {
      console.trace(error.message);
      deferred.reject(error.message);
      return deferred.promise;
    }
  );
  return deferred.promise;
}


///Returns the query based on the query name
//Params: queryName
module.exports.getQuery = function (req,res,next){
  console.log("get query called");
  console.log(req.body);
  var queryName= req.body.queryName;
  console.log(queryName);
  elasticClient.search({
    type:'search',
    title: queryName
  }).then(function (result) {
    var ii = 0, hits_in, hits_out = [];

    hits_in = (result.hits || {}).hits || [];
    for(; ii < hits_in.length; ii++) {
     //hits_out.push(hits_in[ii]._source);
     res.sendStatus(JSON.stringify(hits_in[ii]._source.kibanaSavedObjectMeta.searchSourceJSON));
    }
    if(hits_in.length<1)
    {
      res.sendStatus("No Restults");
    }
    next();
  }, function (error) {
    console.trace(error.message);
  });
}




//Test function

module.exports.runSearch = function (req,res,next){
  var query_string = req.body.searchString;
  console.log(query_string);
  var search = JSON.parse(query_string);
  console.log(" test query");
  //search.query.query_string.query.timestamp = "(>now-15m)";

  var x =   {
      index:search.index,
      query:search.query.query_string.query,
    //  timestamp:"(>now-15m)",
    searchType:"count"//,
  //  '@timestamp':"(>now-15m)"
    //  filter:JSON.stringify(search.filter)
    };
    console.log(JSON.stringify(x));
  elasticClient.search(x
    // {
    //   index:search.index,
    //   filter:search.filter,
    //   query:search.query.query_string.query
    // }
    //query_string
  //  {"index":"logstash-*","highlight":{"pre_tags":["@kibana-highlighted-field@"],"post_tags":["@/kibana-highlighted-field@"],"fields":{"*":{}},"fragment_size":2147483647},"filter":[],"query":{"query_string":{"query":"*","analyze_wildcard":true}}}
  ).then(function (result) {
    console.log("result");
    console.log(result);
    console.log("total result " + result.hits.total);
    var ii = 0, hits_in, hits_out = [];

    hits_in = (result.hits || {}).hits || [];
    console.log(hits.length);
    for(; ii < hits_in.length; ii++) {
     hits_out.push(hits_in[ii]._source);
     //res.sendStatus(JSON.stringify(hits_in[ii]));
    }
     res.sendStatus(JSON.stringify(hits_out));

    if(hits_in.length<1)
    {
      res.sendStatus("No Restults");
    }
    next();
  }, function (error) {
    console.trace(error.message);
  });
}


function getQueryString(queryName, callback)
{
  var deferred = Q.defer();
  console.log("get Query String called");
  elasticClient.search({
    type:'search',
    q: queryName
  }).then(function (result) {
    console.log('Inside get Query string result');
    var ii = 0, hits_in, hits_out = [];

    hits_in = (result.hits || {}).hits || [];
    console.log('Count of Results: ' + hits_in.length);

    var result;
    for(; ii < hits_in.length; ii++) {
        result = hits_in[ii]._source.kibanaSavedObjectMeta.searchSourceJSON;
    }
    deferred.resolve(result);
    console.log("Search result");
    console.log(result);
    return result;
  //  console.log("returned query string " + result);
  //  deferred.promise.nodeify(callback);
  //  return deferred.promise;
  }, function (error) {
    console.trace(error.message);
     deferred.reject(error.message);
    return error.message;
  });
  return deferred.promise;
}


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
