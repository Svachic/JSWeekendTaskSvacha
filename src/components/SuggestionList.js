import React, { Component } from 'react';

//custom suggestion list component
class SuggestionList extends Component {

    render() {
        return (
            this.props.searchedLocations.length > 0 ? (
                <div className="autocomplete" style={{ left: this.props.acLeft, top: this.props.acTop }}>
                    {this.props.searchedLocations.map((item, i) =>
                        <div key={i} className={"autocomplete-item " + (this.props.selectedLocationIndex === i ? "autocomplete-item-selected" : "")}
                            onClick={this.props.selectLocation.bind(this, item.node.name)}>

                            {item.node.name + (item.node.country !== null ? " (" + item.node.country.name + ")" : "")}
                        </div>

                    )}
                </div>)
                : ""
        );
    }
}

export default SuggestionList