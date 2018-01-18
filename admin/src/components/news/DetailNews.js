import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";

import { Container, Grid, TextArea, Button, Menu, Dropdown, Label, Input} from 'semantic-ui-react'

// for editor
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

//import NewsItemWrapper from '../wrapper/NewsItemWrapper';

//@NewsItemWrapper
@withRouter
@inject("store")
@observer
class DetailNews extends Component {
    constructor(props) {
		super(props);
        this.store = this.props.store;
    }


    componentDidMount() {
        this.store.newsState.errorFlash = null;
        this.store.newsState.fetchNewsItem(this.props.match.params.id)
    }

    handleClickEdit = (e) => {
        const { history } = this.props;
        const { newsitem } = this.store.newsState;
        history.push('/edit_news/'+newsitem.id)
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
            <Container style={{ marginTop: '5em' }}>
                <div className="page post">
                    {errorFlashView}
                    <Link to="/news">← Back to News</Link>
                    {!!newsitem &&
                        <article>
                            <h1>{newsitem.category}</h1>
                            <hr />
                            <h2>{newsitem.title}</h2>
                            <hr />
                            <p dangerouslySetInnerHTML={{__html: newsitem.subject}}></p>
                            <hr />
                            <p>{newsitem.created_at}</p>
                        </article>}
                    <hr />
                    <Button basic color='violet' fluid size='small' onClick={this.handleClickEdit}>Edit</Button>
                </div>
            </Container>
        );
    }
}


export default DetailNews;