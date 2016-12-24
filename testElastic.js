var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
                                                host: '127.0.0.1:9200',
                                                sniffOnStart: true,
                                                apiVersion:'2.2',
                                                log: 'error'
                                            });


 function pingCluster(){
     console.info('ping');
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

function testDelete(){
  console.info('Deleted');
                      elasticClient.indices.delete({
                      index: 'myindex',
                      ignore: [404]
                    }).then(function (body) {
                      // since we told the client to ignore 404 errors, the
                      // promise is resolved even if the index does not exist
                      console.log('index was deleted or never existed');
                    }, function (error) {
                      // oh no!
                      console.info('Deleted');
                      console.error(error);
                    });
}

function createIndex(){
  console.info('CreateIndex');
                      elasticClient.index({
                      index: 'myindex',
                      consistency:"all",
                      opType:"create",
                      type: 'mytype',
                      id: '3',
                  //    consistency : "all",
                      body: {
                        title: 'Test 1',
                        tags: ['y', 'z'],
                        published: true,
                      }
                    }, function (error, response) {
                      console.info('CreateIndex');
console.error(error);
                    });
                  //  createDocument();


}

function createDocument(){
  console.info('create Document');
                  elasticClient.create({
                    index: 'myindex',
                    consistency:"all",
                    type: 'mytype',
                    id: '4',
              //      consistency : "all",
                    body: {
                      title: 'Test 1',
                      tags: ['y', 'z'],
                      published: true,
                      published_at: '2013-01-01',
                      counter: 1
                    }
                  }, function (error, response) {
                    // ...
                    console.info('create Document');
                    console.error(error);
                  });
                //    testDelete();

}

pingCluster();
listSearches();
createIndex();
createDocument();
