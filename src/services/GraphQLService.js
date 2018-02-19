//graphQL url of API
const graphQLurl = 'https://graphql.kiwi.com';

class GraphQLService {

    //return pagination string for graphQL query for flights
    //type:1=if we search first time,2=if we go to next page,3=if we go to previous page
    //pageInfo = current state of flights paging
    //itemsCount = number of items to display on page
    getPaginationString(type, pageInfo, itemsCount) {
        let result = "";

        //first page search
        if (type === 1) {
            result = ` first: ${itemsCount}`;
        }
        //next page
        else if (type === 2) {
            result = ` last: ${itemsCount}  , before: "${pageInfo.startCursor}"`;
        }
        //previous
        else if (type === 3) {
            result = ` first: ${itemsCount}  , after: "${pageInfo.endCursor}"`;
        }

        return result;
    }

    //fetch data of flights from graphQL API
    fetchFlightsData(fromPlace, toPlace, fromDate, pageType, pageInfo, itemsPerPage) {

        //construct graphQL query
        let query = `{
  allFlights(search: {from: {location: "${fromPlace}"},
   to: {location: "${toPlace}"}, 
   date: {exact: "${fromDate}"}},
   ${ this.getPaginationString(pageType, pageInfo, itemsPerPage)}
   ,options: {currency: EUR}) {    
    pageInfo{
      hasNextPage,
      hasPreviousPage,
      startCursor,
      endCursor
    },
    edges {
      cursor,
      node {
        airlines{
          logoUrl,
          name
        },
        departure {
          time
          localTime
        }
        legs {
          id
        }
        airlines {
          name
        }
        duration
        price {
          amount
          currency
        }
      }
    }
  }
}`;

        //fetch the data
        return fetch(graphQLurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: query
            }),
        });

    }

    //fetch data of locations from graphQL API
    fetchLocationsData(searchLocationText) {
        //fetch data of locations from graphQL api
        return fetch(graphQLurl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                query: `{
          allLocations(search: "${searchLocationText}", first: 5) {
            edges {
              node {
                name
                country {
                  name
                }
              }
            }
          }
        }` }),
        });
    }
}


export default GraphQLService