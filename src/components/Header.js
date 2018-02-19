import React, { Component } from 'react';

import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';

import { LinearProgress } from 'material-ui/Progress';

class Header extends Component {

    render() {
        return (
            <div>
                <AppBar position="static" color="primary">
                    <Toolbar>
                        <Typography variant="title">
                            Simple flights search app
                         </Typography>
                    </Toolbar>
                </AppBar>

                <div style={{ height: "8px" }}>
                    {this.props.isBusy ? (
                        <LinearProgress />
                    ) : ""}
                </div>
            </div>
        );
    }
}

export default Header