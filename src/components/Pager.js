import React, { Component } from 'react';

import Grid from 'material-ui/Grid';
import Button from 'material-ui/Button';

class Pager extends Component {

    render() {
        return (
            <div>
                {this.props.flights.length > 0 ? (
                    <Grid item container className="container-max">
                        <Grid item xs={6}>
                            <Button disabled={this.props.isBusy || this.props.currentPage === 1} variant="raised" color="primary" onClick={this.props.previousFlightsPage} fullWidth >
                                Previous
                            </Button>
                        </Grid>
                        <Grid item xs={6} >
                            <Button disabled={this.props.isBusy || (!this.props.movedNext && !this.props.pageInfo.hasNextPage) || (this.props.movedNext && !this.props.pageInfo.hasNextPage)} variant="raised" color="primary" onClick={this.props.nextFlightsPage} fullWidth >
                                Next
                            </Button>
                        </Grid>
                    </Grid>
                )
                    :
                    (
                        <div className="no-results">
                            NO RESULTS
                </div>
                    )
                }
            </div>
        );
    }
}

export default Pager