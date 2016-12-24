var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
                                                host: '127.0.0.1:9200',
                                                sniffOnStart: true,
                                                apiVersion:'2.2',
                                                log: 'error'
                                            });


 function pingCluster(){
                                                      elasticClient.ping({
                                                                          requestTimeout: 30000,
                                                                          // undocumented params are appended to the query string
                                                                          hello: "elasticsearch"
                                                                        }, function (error) {
                                                                          if (error) {
                                                                            console.error('elasticsearch cluster is down!');
                          //                                                  res.sendStatus(false);
                        //                                                    next();
                                                                          } else {
                                                                            console.info('All is well');
                            //                                                res.sendStatus(true);
                      //                                                      next();
                                                                          }
                                                                        });
                                                    }

function listSearches(){
                 console.info('ListSearches');
                 elasticClient.search({
                                         type:'search',
                                         name:''
                                       }).then(function (body) {
                                                                 var searches=[];
                                                                 for(var result in body.hits.hits)
                                                                 {
                                                                   searches.push(result);
                                                                 }
                                                                 console.info(searches);
                                                               }, function (error) {
                                                                 console.error(error);
                    //                                             traceEvent(error.message);
                                                               });
               }




pingCluster();
listSearches();
