import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";
import Script from 'react-load-script'

import { Grid} from 'semantic-ui-react'

@withRouter
@inject("store")
@observer
class News extends Component {
    constructor(props) {
        super(props);
        this.store = this.props.store;
    }

    componentDidMount() {
        //this.store.newsState.fetchNewsData();
    }

    render() {
        return (
            <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle' >
                <Grid.Column style={{ marginTop: '10em'  }}>
                    <h1>News</h1>
                </Grid.Column>
            </Grid>
          );
    }
}


export default News;