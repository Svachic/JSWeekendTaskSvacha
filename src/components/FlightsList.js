import React, { Component } from 'react';
import Paper from 'material-ui/Paper';

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
                <Paper key={i} style={{ width: "100%", minHeight: "65px", marginTop: "10px", color: "#222223" }}>


                    <div style={{ padding: "7px", width: "115px", display: "inline-block" }}>
                        <label style={{ fontWeight: "500", fontSize: "20px" }}> {item.node.price.amount} €
                      </label>
                        <label style={{ fontSize: "12px", display: "block", marginTop: "14px" }}>Duration: {this.getTimeString(item.node.duration)}
                        </label>
                    </div>
                    <div style={{ width: "1px", height: "100%", backgroundColor: "#efefef", display: "inline-block" }}>
                    </div>
                    <div style={{ padding: "7px", display: "inline-block", width: "231px" }}>

                        <label style={{ fontSize: "14px", display: "block" }}>Departure: {new Date(item.node.departure.time).toLocaleString()}
                        </label>
                        <label style={{ fontSize: "12px", display: "block", marginTop: "8px", marginBottom: "2px" }}>{item.node.legs.length === 1 ? "direct flight" : "Stops: " + (item.node.legs.length - 1)}
                        </label>

                        <label style={{ fontSize: "12px", display: "block" }}>From {this.props.selectedFrom} to {this.props.selectedTo}
                        </label>
                    </div>
                    <div style={{ padding: "7px", display: "inline-block" }}>

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