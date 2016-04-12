var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
    //host: '127.0.0.1:9200',
    host: '192.168.1.104:9200',
    sniffOnStart: true,
    apiVersion:'2.2',
    log: 'info'
});

console.log("ping elastic");
elasticClient.ping({
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

console.log("quick search");

elasticClient.search({
  type:'search',
   'index-pattern': "/settings/objects/savedSearches/"
}).then(function (body) {
  var ii = 0, hits_in, hits_out = [];
  hits_in = (body.hits || {}).hits || [];
  //deferred.resolve(result.hits);
  var result=[];
  for(; ii < hits_in.length; ii++) {
      result.push(JSON.stringify(hits_in[ii]._source.kibanaSavedObjectMeta.searchSourceJSON));
  }
console.log(result);

//   var searches=[];
//   var inHits = body.hits.hits;
//   for(var result in inHits)
//   {
//     searches.push(JSON.stringify(result));
//     console.log(JSON.stringify(result));
//   }
//   console.log(JSON.stringify(searches));
//   var hits = body.hits.hits;
// //  res.send(hits[0]._source.kibanaSavedObjectMeta.searchSourceJSON);
//   console.log(hits[0]);
}, function (error) {
  console.trace(error.message);
});



// 'search': '/discover',
//        'index-pattern': '/settings/objects/savedSearches/' + $route.current.params.id
//
// function getQuery($queryName){
//   console.log($queryName);
//   elasticClient.search({
//     type:'search',
//     title: 'BlaBla'
//   }).then(function (body) {
//     var hits = body.hits.hits;
//   //  res.send(hits[0]._source.kibanaSavedObjectMeta.searchSourceJSON);
//     console.log(hits);
//   }, function (error) {
//     console.trace(error.message);
//   });
// }

//getQuery('BlaBla');

console.log('Get Named Of Search');

//
// function ListSearches(){
// console.log('Get List Of searches');
//
//   //return a list of search types.
//   elasticClient.search({
//     type:'search'
//   }).then(function (body) {
//     var searches=[];
//     for(var result in hits)
//     {
//       searches.push(result);
//     }
//     console.log(searches);
//   }, function (error) {
//     console.trace(error.message);
//   });
// }
//ListSearches();
  //return a list of search types.
  // elasticClient.search({
  //   type:'search'
  // }).then(function (body) {
  //   var hits = body.hits.hits;
  //   //console.log(hits);
  //   console.log(hits[0]);
  //   console.log(hits[1].query_string);
  //   //console.log(hits[2].query_string);
  //   //console.log(hits[1].source);
  //   //res.send(hits);
  // }, function (error) {
  //   console.trace(error.message);
  // });
