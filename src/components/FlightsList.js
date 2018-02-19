import React, { Component } from 'react';
import Paper from 'material-ui/Paper';
import './FlightsList.css';

class FlightsList extends Component {


    //format minutes time to more readable format ##h ##m
    getTimeString(minutes) {

        let hours = minutes / 60.0;
        let hrInt = parseInt(hours, 10);
        let mins = hrInt > 0 ? parseInt((hours - hrInt) * 60.0, 10) : minutes;

        let result = `${hrInt}h ${mins}m`;

        return result;
    }

    render() {
        return (
            this.props.flights.map((item, i) =>
                <Paper key={i} className="flight-paper">


                    <div className="flight-paper-item flight-paper-item-1">
                        <label className="price-label"> {item.node.price.amount} €
                      </label>
                        <label className="duration-label">Duration: <span className="bold-label">{this.getTimeString(item.node.duration)}</span>
                        </label>
                    </div>

                    <div className="flight-paper-item flight-paper-item-2">

                        <label className="departure-label">Departure: {new Date(item.node.departure.time).toLocaleDateString()} <span className="bold-label">{new Date(item.node.departure.time).toLocaleTimeString()}</span>
                        </label>
                        <label className="stops-label">{item.node.legs.length === 1 ? "direct flight" : "Stops: " + (item.node.legs.length - 1)}
                        </label>

                        <label className="fromto-label">From {this.props.selectedFrom} to {this.props.selectedTo}
                        </label>
                    </div>
                    <div className="flight-paper-item">

                        {item.node.airlines.map((imgitem, iim) =>
                            <img className="al-img" key={iim} src={imgitem.logoUrl} title={imgitem.name} alt={imgitem.name} />
                        )
                        }
                    </div>
                </Paper>

            )
        );
    }
}

export default FlightsList