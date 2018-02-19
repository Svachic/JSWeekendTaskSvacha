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
import SuggestionList from './components/SuggestionList';
import GraphQLService from './services/GraphQLService';

//Material UI theme - try to use Material-UI beta library (v1.0.0-beta.34)
//lets use green theme :)
const theme = createMuiTheme({
  palette: {
    primary: lightGreen,
    secondary: lightGreen
  },
});

//GraphQL service to fetch the data from GraphQL API
const graphQLService = new GraphQLService();

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
      fromPlace: "Prague",
      //location(place) to - place of arrivle
      toPlace: "Paris",
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

  //use for default datepicker value and date control
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

  //fetch and process data from graphQL service
  fetchFlightsData(pageType) {
    if (this.state.isBusy || this.state.toPlace === "" || this.state.fromPlace === "" || this.state.fromDate === "") {
      //we can warn user about required fields... but now i disabled only search button
    } else {
      //try to fetch data from graphQL API - use only standard fetch method
      try {
        this.setState({ isBusy: true, selectedFrom: this.state.fromPlace, selectedTo: this.state.toPlace });
       
        graphQLService.fetchFlightsData(this.state.fromPlace, this.state.toPlace, this.state.fromDate, pageType, this.state.pageInfo, this.state.itemsPerPage)
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

      //fetch data of locations
      graphQLService.fetchLocationsData(searchLoc)
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

  //clear andhide suggestion when blur location inputs
  placeBlur() {
    setTimeout(t => {
      this.setState({ searchedLocations: [], selectedLocationIndex: 0 });
    }, 200);
  }

  //if we focus input field of from to select the text of the input to easy rewrite the text
  handleInputFocus(event) {
    event.target.select();
  }

//controll location inputs with suggestion and search the flights
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

  //set selected suggested location to the state
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

          <Grid item className="container-max">
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

              <SuggestionList searchedLocations={this.state.searchedLocations}
                selectedLocationIndex={this.state.selectedLocationIndex}
                selectLocation={this.selectLocation}
                acLeft={this.state.acLeft}
                acTop={this.state.acTop}>
              </SuggestionList>

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
