import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";
import Script from 'react-load-script'

//import { Dimmer, Loader, Segment, Card, Icon, Button, Image, Message } from 'semantic-ui-react'

@withRouter
@inject("store")
@observer
class News extends Component {
    constructor(props) {
        super(props);
        this.store = this.props.store;
    }

    componentDidMount() {
        this.store.newsState.fetchNewsData();
    }

    render() {

        const { newsItems } = this.store.newsState;
        //console.log(this.props.match.path);

        return (
            <div>
                <div id="News" className="page posts">
                    <h1>News</h1>
                    <hr />
                    <ul>
                        {newsItems && newsItems.length
                            ? newsItems.slice(0, newsItems.length).map(post => {
                                    return (
                                        <li key={post.id}>
                                            <Link to={`${this.props.match.path}/${post.id}`} >   
                                                <h1>[ {post.category} ]</h1>
                                                <h1>{post.title}</h1>
                                            </Link>
                                            <p>{String(post.created_at).replace('T', ' ').replace('Z', '')}</p>
                                            <p>{post.subject.substring(0, 120)}</p>
                                        </li>
                                    );
                                })
                            : "Loading..."}
                        
                    </ul>
                    
                    <ul id="attachNews"></ul>

                </div>
              
              <Script url="/assets/js/infiniteScroll.js"/>

            </div>
          );
    }
}


export default News;