import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";
import Script from 'react-load-script'

import { Grid, TextArea, Button, Divider} from 'semantic-ui-react'

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
        this.newsState.fetchNews();
    }

    handelClick = (e) => {
        const { history } = this.props;
        history.push('/add_news');
    }

    render() {

        return (
            <div>
                <Grid textAlign='center' columns={3}>
                    <Grid.Row verticalAlign='middle' style={{ maxWidth: 850, marginTop: '5em'  }}>
                        <Grid.Column>
                            <h1>News</h1>
                        </Grid.Column>
                        <Grid.Column></Grid.Column>
                        <Grid.Column>
                            <Button color='violet' fluid size='small' onClick={this.handelClick}>Add news</Button>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>
                
                <Grid textAlign='center' style={{ height: '100%' }} >
                    <Grid.Row verticalAlign='middle' >
                        <Grid.Column style={{ maxWidth: 1000 }}>
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