import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";
import Script from 'react-load-script'

import { Grid, TextArea, Button} from 'semantic-ui-react'

@withRouter
@inject("store")
@observer
class News extends Component {

    constructor(props) {
        super(props);
        
        this.appState = this.props.store.appState;
        this.newsState = this.props.store.newsState;
    }

    
    componentDidMount() {
        const { history } = this.props;
        this.newsState.fetchNews();
    }

    render() {

        return (
            <div>
                <Grid textAlign='center' style={{ height: '100%' }} >
                    <Grid.Row verticalAlign='middle' >
                        <Grid.Column style={{ maxWidth: 850, marginTop: '5em'  }}>
                            <h1>News</h1>
                            <hr />
                            <div className="page home">
                                <div id="tabulator-1"></div>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                
            </div>
        );
      }
}


export default News;