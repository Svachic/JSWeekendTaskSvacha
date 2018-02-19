import React, { Component } from 'react';
import './App.css';
import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';
import { MuiThemeProvider, createMuiTheme } from 'material-ui/styles';
import lightGreen from 'material-ui/colors/lightGreen';
import TextField from 'material-ui/TextField';
import FlightsList from './components/FlightsList';
import Header from './components/Header';
import Pager from './components/Pager';

//graphQL url of API
const graphQLurl = 'https://graphql.kiwi.com';

//Material UI theme - try to use Material-UI beta library (v1.0.0-beta.34)
//lets use green theme :)
const theme = createMuiTheme({
  palette: {
    primary: lightGreen,
    secondary: lightGreen
  },
});


class App extends Component {

  constructor(props) {
    super(props);

    //methods binding to this
    this.fetchFlightsData = this.fetchFlightsData.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.selectLocation = this.selectLocation.bind(this);
    this.placeBlur = this.placeBlur.bind(this);
    this.placeKeyUp = this.placeKeyUp.bind(this);
    this.handleInputFocus = this.handleInputFocus.bind(this);
    this.searchForFlights = this.searchForFlights.bind(this);
    this.nextFlightsPage = this.nextFlightsPage.bind(this);
    this.previousFlightsPage = this.previousFlightsPage.bind(this);

    //set today string
    let today = new Date();
    this.todayString += today.getFullYear() + "-";
    if (today.getMonth() < 9)
      this.todayString += "0" + (today.getMonth() + 1).toString() + "-";
    else
      this.todayString += (today.getMonth() + 1).toString() + "-";
    if (today.getDate() < 10)
      this.todayString += ("0" + today.getDate());
    else
      this.todayString += (today.getDate());

    //application state
    this.state = {
      //busy indicator when fetching flights data
      isBusy: false,
      //array of flights
      flights: [],
      //array of suggested locations
      searchedLocations: [],
      //selected suggested locations from list
      selectedLocationIndex: 0,
      //selectedInputforSuggestion
      selectedLocationInput: "",
      //location(place) from - place of departure
      fromPlace: "",
      //location(place) to - place of arrivle
      toPlace: "",
      //date od departure
      fromDate: this.todayString,
      //prop for fetch flights metod - we wouldnt bind directly fromPlace prop
      selectedFrom: "",
      //prop for fetch flights metod - we wouldnt bind directly toPlace prop
      selectedTo: "",
      //position left of suggestion list of locations
      acLeft: 0,
      //position top of suggestion list of locations
      acTop: 0,
      //number of flight items displayed in the page
      itemsPerPage: 5,
      //current page of flights(based on itemsPerPage)
      currentPage: 1,
      //indicator of move next paging - if we display next button for example
      movedNext: false,
      //flight pagination object
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        endCursor: "",
        startCursor: "",
      }
    };

  }

  todayString = "";

  //handle input fiels - set state and suggest locations
  handleInputChange(event) {

    const target = event.target;
    let value = target.value;
    const name = target.name;

    //control fromDate input - accept only today+ days
    if (name === 'fromDate') {
      let valdate = new Date(value);
      if (valdate.getTime() < Date.now())
        value = this.todayString;
    }
    //display suggestion of locations
    else if (name === 'fromPlace') {
      this.setState({ selectedLocationInput: name });
      this.fetchLocationsData(value, name);
    } else if (name === 'toPlace') {
      this.setState({ selectedLocationInput: name });
      this.fetchLocationsData(value, name);
    }

    this.setState({
      [name]: value
    });
  }

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

  //first time search of flights
  searchForFlights() {
    //set state for search in mode 1 = first time
    this.setState({
      flights: [],
      currentPage: 1,
      movedNext: false,
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        endCursor: "",
        startCursor: "",
      }
    });

    this.fetchFlightsData(1);
  }

  nextFlightsPage() {
    //scroll to top - to show the first results of page
    window.scrollTo(0, 0);
    this.setState({ startCursor: "", currentPage: this.state.currentPage + 1, movedNext: true });
    this.fetchFlightsData(3);
  }

  previousFlightsPage() {
    //scroll to top - to show the first results of page
    window.scrollTo(0, 0);
    this.setState({ endCursor: "", currentPage: this.state.currentPage - 1 });
    this.fetchFlightsData(2);
  }

  fetchFlightsData(pageType) {
    if (this.state.isBusy || this.state.toPlace === "" || this.state.fromPlace === "" || this.state.fromDate === "") {
      //we can wanr user about required fields...

    } else {
      //try to fetch data from graphQL API - use only standard fetch method
      try {
        this.setState({ isBusy: true, selectedFrom: this.state.fromPlace, selectedTo: this.state.toPlace });

        //construct graphQL query
        let query = `{
  allFlights(search: {from: {location: "${this.state.fromPlace}"},
   to: {location: "${this.state.toPlace}"}, 
   date: {exact: "${this.state.fromDate}"}},
   ${ this.getPaginationString(pageType, this.state.pageInfo, this.state.itemsPerPage)}
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
        fetch(graphQLurl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: query
          }),
        })
          .then(res => res.json())
          .then(t => {

            //if everithing is ok update component state and show results
            let dataflights = t.data.allFlights.edges;
            let pageInfo = t.data.allFlights.pageInfo;

            this.setState({
              isBusy: false,
              flights: dataflights,
              pageInfo: pageInfo
            });

          }).catch(c => {
            this.setState({ isBusy: false });
          });

      } catch (exc) {
        this.setState({ isBusy: false });
      }
    }
  }

  //method to fetch data of available locations from API - search by name
  //use for input suggestion
  //searchLoc = text to search
  fetchLocationsData(searchLoc, inputName) {

    //search only if search string length is greater then 1
    if (searchLoc !== null && searchLoc.length > 1) {

      //fetch data of locations from graphQL api
      fetch(graphQLurl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `{
          allLocations(search: "${searchLoc}", first: 5) {
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
      })
        .then(res => res.json())
        .then(t => {
          let locations = t.data.allLocations.edges;

          let frominp = document.getElementById(inputName);
          let fib = frominp.getBoundingClientRect();

          this.setState({ isBusy: false, selectedLocationIndex: 0, searchedLocations: locations, acLeft: fib.left + 6, acTop: fib.top + 33 });
        }).catch(c => {
          this.setState({ isBusy: false, selectedLocationIndex: 0, searchedLocations: [] });
        });


    }
    else
      this.setState({ searchedLocations: [] });
  }

  placeBlur() {
    setTimeout(t => {
      this.setState({ searchedLocations: [], selectedLocationIndex: 0 });
    }, 200);
  }

  //if we focus input field of from to select the text of the input to easy rewrite the text
  handleInputFocus(event) {
    event.target.select();
  }


  placeKeyUp(event) {
    if (this.state.searchedLocations.length > 0) {
      //up
      if (event.keyCode === 38) {
        if (this.state.selectedLocationIndex > 0)
          this.setState({ selectedLocationIndex: this.state.selectedLocationIndex - 1 });
      }
      //down
      else if (event.keyCode === 40) {
        if (this.state.selectedLocationIndex < this.state.searchedLocations.length - 1)
          this.setState({ selectedLocationIndex: this.state.selectedLocationIndex + 1 });
      }
      //enter
      else if (event.keyCode === 13) {
        this.selectLocation(this.state.searchedLocations[this.state.selectedLocationIndex].node.name);
      }
    } else {
      if (event.keyCode === 13) {
        this.searchForFlights();
      }
    }
  }

  //set selected suggested location to state
  selectLocation(name) {

    this.setState({ [this.state.selectedLocationInput]: name, searchedLocations: [] });
  }



  //render the component  
  render() {
    return (
      <MuiThemeProvider theme={theme}>


        <Header isBusy={this.state.isBusy}>
        </Header>

        <Grid alignItems="center" container direction="column"  >

          <Grid item style={{ maxWidth: "1000px", padding: "18px" }}>
            <form autoComplete="off" onSubmit={this.searchForFlights}>
              <TextField
                id="fromPlace"
                name="fromPlace"
                label="Destination from"
                required
                disabled={this.state.isBusy}
                margin="normal" fullWidth
                value={this.state.fromPlace}
                onBlur={this.placeBlur}
                onFocus={this.handleInputFocus}
                onKeyDown={this.placeKeyUp}
                onChange={this.handleInputChange} />

              <TextField
                id="toPlace"
                name="toPlace"
                required
                disabled={this.state.isBusy}
                label="Destination to"
                value={this.state.toPlace}
                onFocus={this.handleInputFocus}
                onBlur={this.placeBlur}
                onKeyDown={this.placeKeyUp}
                onChange={this.handleInputChange}
                margin="normal" fullWidth />


              {this.state.searchedLocations.length > 0 ? (
                <div className="autocomplete" style={{ left: this.state.acLeft, top: this.state.acTop }}>
                  {this.state.searchedLocations.map((item, i) =>
                    <div key={i} className={"autocomplete-item " + (this.state.selectedLocationIndex === i ? "autocomplete-item-selected" : "")}
                      onClick={this.selectLocation.bind(this, item.node.name)}>

                      {item.node.name + (item.node.country !== null ? " (" + item.node.country.name + ")" : "")}
                    </div>

                  )}
                </div>)
                : ""}


              <TextField
                id="fromDate"
                name="fromDate"
                label="Date"
                required
                disabled={this.state.isBusy}
                value={this.state.fromDate}
                type="date"
                onKeyDown={this.placeKeyUp}
                onChange={this.handleInputChange}
                InputLabelProps={{
                  shrink: true,
                }}
                margin="normal" fullWidth />


              <Button disabled={this.state.isBusy || this.state.toPlace === "" || this.state.fromPlace === "" || this.state.fromDate === ""} variant="raised" color="primary" onClick={this.searchForFlights} fullWidth>
                SEARCH
              </Button>
            </form>

            <FlightsList flights={this.state.flights} selectedFrom={this.state.selectedFrom} selectedTo={this.state.selectedTo} >
            </FlightsList>


            <Pager isBusy={this.state.isBusy}
              currentPage={this.state.currentPage}
              movedNext={this.state.movedNext}
              flights={this.state.flights}
              pageInfo={this.state.pageInfo}
              nextFlightsPage={this.nextFlightsPage}
              previousFlightsPage={this.previousFlightsPage}>
            </Pager>

          </Grid>
        </Grid>


      </MuiThemeProvider>
    );
  }
}

export default App;
