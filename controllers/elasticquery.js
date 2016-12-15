var Q = require ('q');
var elasticsearch = require('elasticsearch');
var fs = require('fs')
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
                                                host: global.elastichost,
                                                sniffOnStart: true,
                                                apiVersion:'2.2',
                                                log: global.tracelevel
                                            });

//pingCluster
//returns a list of servers in the cluster
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
                                                                            logEvent('All is well');
                                                                            res.sendStatus(true);
                                                                            next();
                                                                          }
                                                                        });
                                                    }

//PingClusterInternal
module.exports.PingClusterInternal = function(){

                                                elasticClient.ping({
                                                                    requestTimeout: 30000,
                                                                    // undocumented params are appended to the query string
                                                                    hello: "elasticsearch"
                                                                  }, function (error) {
                                                                    if (error) {
                                                                      console.error('elasticsearch cluster is down!');
                                                                      res.sendStatus(false);

                                                                    } else {
                                                                      logEvent('All is well');
                                                                      res.sendStatus(true);

                                                                    }
                                                                  });
                                              }

//ListSearches
//Returns a list of defined searches
module.exports.ListSearches= function(req,res,next){
                                                  logEvent('ElasticController:ListSearches');
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
                                                                                                }, function (error) {
                                                                                                  traceEvent(error.message);
                                                                                                });
                                                }



function getQuery(queryName){
                            elasticClient.search({
                                                    type:'search',
                                                    name:queryName
                                                  }).then(function (body) {
                                                    var hits = body.hits.hits;
                                                    return hits[0];

                                                  }, function (error) {
                                                    traceEvent(error.message);
                                                  });
                          }

//EvaluateSearchInternal
//queryName - Query name
//timeFrame - time frame Now till - (24h or 2m)
module.exports.EvaluateSearchInternal = function(queryName,timeFrame){
                                                                    logEvent("ElasticController:EvaluateSearchInternal");
                                                                    var deferred = Q.defer();

                                                                    var query = getQueryString(queryName).then(function(result){
                                                                                                                                runTimeFrameSearchInternal(result,timeFrame)
                                                                                                                                .then(function(queryResult){
                                                                                                                                                              deferred.resolve(queryResult);
                                                                                                                                                              return queryResult;
                                                                                                                                                            });
                                                                                                                              },function(err){
                                                                                                                                                traceEvent(err);
                                                                                                                                                deferred.reject(err);
                                                                                                                                                return deferred.promise;
                                                                                                                                              });
                                                                  return deferred.promise;
                                                                }


module.exports.EvaluateSearch = function(req,res,next){
                                                      var queryName = req.body.queryName;
                                                      var timeFrame = req.body.timeFrame;
                                                      var query = getQueryString(queryName)
                                                      .then(function(result){
                                                                              runTimeFrameSearchInternal(result,timeFrame)
                                                                              .then(function(queryResult){
                                                                                                                res.sendStatus(queryResult);
                                                                                                                next();
                                                                                                              });
                                                                                                            },function(err){
                                                                                                                            logEvent(err.message);
                                                                                                                            res.sendStatus(err.message);
                                                                                                                            next();
                                                                                                                          });
                                                                              }

//Call search by name
module.exports.CallQuery= function(req,res,next){
                                                logEvent("ElasticController:CallQuery");
                                                var queryName = req.body.queryName;

                                                var query = getQueryString(queryName).then(function(result){
                                                                                                                logEvent('GetQueryString:' + result);
                                                                                                                runSearchInternal(result).then(function(innerresult){
                                                                                                                                                                      logEvent("ReturnResult:" + innerresult);
                                                                                                                                                                      res.sendStatus(innerresult);
                                                                                                                                                                      next();
                                                                                                                                                                    },function(err){
                                                                                                                                                                                      logEvent(err.message);
                                                                                                                                                                                    });
                                                                                                             });
                                              }


function runSearchInternal(query,timeFrame){
                                            var deferred = Q.defer();
                                            logEvent("ElasticController:runSearchInternal");
                                            logEvent(query);
                                            var search = JSON.parse(query);
                                            logEvent("post query" + search.query.query_string);

                                            var x = {
                                              index:search.index,
                                              searchType:"count",
                                              q:'@timestamp:(>now-24h) AND ' +search.query.query_string.query
                                            };

                                            elasticClient.search(x).then(function(result){
                                                                                          var ii = 0, hits_in, hits_out = [];
                                                                                          hits_in = (result.hits || {}).hits || [];
                                                                                          deferred.resolve(result.hits);

                                                                                          var result;
                                                                                          for(; ii < hits_in.length; ii++) {
                                                                                                                                result = JSON.stringify(hits_in[ii]._source.kibanaSavedObjectMeta.searchSourceJSON);
                                                                                                                            }
                                                                                          logEvent("Search result:" + result.hits);
                                                                                          return result.hits;

                                                                                        }, function (error) {
                                                                                                              traceEvent(error.message);
                                                                                                              deferred.reject(error.message);
                                                                                                              return deferred.promise;
                                                                                                            }
                                                                                      );
                                            return deferred.promise;
                                          }

function runTimeFrameSearchInternal(query,timeFrame){
                                                    var deferred = Q.defer();
                                                    logEvent("ElasticController:runTimeFrameSearchInternal");
                                                    var search = JSON.parse(query);
                                                    logEvent("post query" + JSON.stringify(search.query.query_string));

                                                    var x = {
                                                              index:search.index,
                                                              //searchType:"count",
                                                              q:'@timestamp:(>now-' + timeFrame + ') AND ' +search.query.query_string.query//,
                                                            };

                                                    elasticClient.search(x).then(
                                                                                function(result){
                                                                                                  var ii = 0, hits_in, hits_out = [];
                                                                                                  hits_in = (result.hits || {}).hits || [];

                                                                                                  deferred.resolve(result.hits);
                                                                                                  var result;
                                                                                                  for(; ii < hits_in.length; ii++) {
                                                                                                                                        result = JSON.stringify(hits_in[ii]._source.kibanaSavedObjectMeta.searchSourceJSON);
                                                                                                                                    }
                                                                                                  logEvent("Search result:" + JSON.stringify(result.hits));
                                                                                                  return result.hits;
                                                                                                }, function (error) {
                                                                                                                      traceEvent(error.message);
                                                                                                                      deferred.reject(error.message);
                                                                                                                      return deferred.promise;
                                                                                                                    }
                                                                              );
                                                    return deferred.promise;
                                                  }


//GetSearchResult
//queryName - Query name
//timeFrame - time frame Now till - (24h or 2m)
//numResults - count of results
module.exports.GetSearchResult = function(queryName,timeFrame,numResults){
                                                                            logEvent("Get Search Result");
                                                                            var deferred = Q.defer();

                                                                            var query = getQueryString(queryName).then(function(result){
                                                                                                                                        runTimeFrameSearchInternalWResults(result,timeFrame,numResults)
                                                                                                                                          .then(function(queryResult){
                                                                                                                                                                        deferred.resolve(queryResult);
                                                                                                                                                                        return queryResult;
                                                                                                                                                                      });
                                                                                                                                        },function(err){
                                                                                                                                                        traceEvent(err);
                                                                                                                                                        deferred.reject(err);
                                                                                                                                                        return deferred.promise;
                                                                                                                                                      });
                                                                          return deferred.promise;
                                                                        }

//runTimeFrameSearchInternalWResults
//return the results of the query based on timeframe
function runTimeFrameSearchInternalWResults(query,timeFrame,numResults){
                                                                        var deferred = Q.defer();
                                                                        logEvent("ElasticController:runTimeFrameSearchInternalwResults");
                                                                        var search = JSON.parse(query);
                                                                        logEvent("post query" + JSON.stringify(search.query.query_string));

                                                                        var x = {
                                                                                  index:search.index,
                                                                                  size: numResults,
                                                                                  q:'@timestamp:(>now-' + timeFrame + ') AND ' +search.query.query_string.query//,
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
                                                                                                                      logEvent("Search result: " + JSON.stringify(result.hits));
                                                                                                                      return result.hits;
                                                                                                                    }, function (error) {
                                                                                                                                          traceEvent(error.message);
                                                                                                                                          deferred.reject(error.message);
                                                                                                                                          return deferred.promise;
                                                                                                                                        });
                                                                        return deferred.promise;
                                                                      }


///Returns the query based on the query name
//Params: queryName
module.exports.getQuery = function (req,res,next){
                                                    logEvent("ElasticController:getQuery");
                                                    logEvent(req.body);
                                                    var queryName= req.body.queryName;
                                                    logEvent(queryName);
                                                    elasticClient.search({
                                                                            type:'search',
                                                                            title: queryName
                                                                          }).then(function (result) {
                                                                                                      var ii = 0, hits_in, hits_out = [];
                                                                                                      hits_in = (result.hits || {}).hits || [];

                                                                                                      for(; ii < hits_in.length; ii++) {
                                                                                                                                         res.sendStatus(JSON.stringify(hits_in[ii]._source.kibanaSavedObjectMeta.searchSourceJSON));
                                                                                                                                        }
                                                                                                      if(hits_in.length<1){
                                                                                                                            res.sendStatus("No Restults");
                                                                                                                          }
                                                                                                      next();
                                                                                                    }, function (error) {
                                                                                                                          traceEvent(error.message);
                                                                                                                        });
                                                  }

//Test function
module.exports.runSearch = function (req,res,next){
                                                  var query_string = req.body.searchString;
                                                  logEvent(query_string);
                                                  var search = JSON.parse(query_string);
                                                  logEvent(" test query");
                                                  var x =   {
                                                              index:search.index,
                                                              query:search.query.query_string.query,
                                                              searchType:"count"//,
                                                            };
                                                    logEvent(JSON.stringify(x));
                                                  elasticClient.search(x).then(function (result) {
                                                                                                    logEvent("total result " + result.hits.total);
                                                                                                    var ii = 0, hits_in, hits_out = [];

                                                                                                    hits_in = (result.hits || {}).hits || [];
                                                                                                    logEvent(hits.length);
                                                                                                    for(; ii < hits_in.length; ii++) {
                                                                                                                                       hits_out.push(hits_in[ii]._source);
                                                                                                                                      }
                                                                                                    res.sendStatus(JSON.stringify(hits_out));

                                                                                                    if(hits_in.length<1){
                                                                                                                          res.sendStatus("No Restults");
                                                                                                                        }
                                                                                                    next();
                                                                                                  }, function (error) {
                                                                                                                        traceEvent(error.message);
                                                                                                                      });
                                                }


function getQueryString(queryName, callback){
                                            var deferred = Q.defer();
                                            logEvent("ElasticController:getQueryString");

                                            elasticClient.search({
                                                                  type:'search',
                                                                  q: queryName
                                                                }).then(function (result) {
                                                                                            var ii = 0, hits_in, hits_out = [];

                                                                                            hits_in = (result.hits || {}).hits || [];
                                                                                            logEvent('Count of Results: ' + hits_in.length);

                                                                                            var result;
                                                                                            for(; ii < hits_in.length; ii++) {
                                                                                                                                  result = hits_in[ii]._source.kibanaSavedObjectMeta.searchSourceJSON;
                                                                                                                              }

                                                                                            deferred.resolve(result);
                                                                                            logEvent("Search result: "+ result);
                                                                                            return result;
                                                                                          }, function (error) {
                                                                                                                traceEvent(error.message);
                                                                                                                 deferred.reject(error.message);
                                                                                                                return error.message;
                                                                                                              });
                                            return deferred.promise;
                                          }

function logEvent(message){
                            if(global.tracelevel == 'debug'||global.notificationtracelevel=='debug'){
                                                              console.log(message);
                                                            }
                            if(global.notificationtracelevel=='debug'){
                                                            fs.appendFile(global.loggingDirectory + '/notificationLog.log', "\r\n" + message, function (err) {
                                                              });
                            }
                          }
function traceEvent(message){
                            if(global.tracelevel == 'debug'||global.notificationtracelevel=='debug'){
                                                              console.log(message);
                                                            }
                            if(global.notificationtracelevel=='debug'){
                                                            fs.appendFile(global.loggingDirectory + '/notificationLog.log', "\r\n" + message, function (err) {
                                                              });
                            }
                          }
