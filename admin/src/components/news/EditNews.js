import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import {  Message  } from 'semantic-ui-react'


@withRouter
@inject("store")
@observer
class NewsDetail extends Component {
    constructor(props) {
		super(props);
        this.store = this.props.store;
        
    }
    componentDidMount() {
        //console.log(this.props.match.params.id);
        this.store.newsState.errorFlash = null;
        this.store.newsState.fetchNewsItem(this.props.match.params.id);
    }
    
    render() {

        const { newsitem, errorFlash } = this.store.newsState;

        var errorFlashView = null;
        if(errorFlash) {
            errorFlashView = (
                <Message error visible size='tiny'>{errorFlash}</Message>
            );
        }

		return (
            <div className="page post">
                {errorFlashView}
				<Link to="/news">← Back to News</Link>
				{!!newsitem &&
                    <article>
                        <h1>{newsitem.category}</h1>
                        <hr />
                        <h2>{newsitem.title}</h2>
                        <hr />
                        <p>{newsitem.subject}</p>
                        <hr />
                        <p>{newsitem.created_at}</p>
					</article>}

			</div>
		);
    }
}


export default NewsDetail;